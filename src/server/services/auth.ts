import { and, desc, eq, gt, isNull, ne } from "drizzle-orm";
import { deleteCookie, getCookie, getRequestHeader, getRequestIP, setCookie } from "@tanstack/start-server-core/request-response";
import { env } from "../config";
import { db } from "../db";
import { auditLogs, emailVerificationTokens, notifications, passwordResetTokens, profiles, sessions, users } from "../db/schema";
import { createToken, hashPassword, hashToken, verifyPassword } from "../lib/crypto";
import { assert } from "../lib/errors";
import { email } from "./email";

const sessionDurationSeconds = 60 * 60 * 24 * 14;
const cookieOptions = { httpOnly: true, sameSite: "lax" as const, secure: env.NODE_ENV === "production", path: "/", maxAge: sessionDurationSeconds };
export type SafeUser = { id: string; email: string; role: "user" | "admin" | "super_admin"; status: "active" | "suspended"; emailVerified: boolean; firstName: string; lastName: string; impersonatorId: string | null };
function publicUser(row: { id: string; email: string; role: "user" | "admin" | "super_admin"; status: "active" | "suspended"; emailVerifiedAt: Date | null; firstName: string | null; lastName: string | null; impersonatorId?: string | null }): SafeUser {
  return { id: row.id, email: row.email, role: row.role, status: row.status, emailVerified: Boolean(row.emailVerifiedAt), firstName: row.firstName ?? "", lastName: row.lastName ?? "", impersonatorId: row.impersonatorId ?? null };
}
async function getUserByEmail(emailAddress: string) {
  const [row] = await db.select({ id: users.id, email: users.email, passwordHash: users.passwordHash, role: users.role, status: users.status, emailVerifiedAt: users.emailVerifiedAt, firstName: profiles.firstName, lastName: profiles.lastName }).from(users).leftJoin(profiles, eq(profiles.userId, users.id)).where(eq(users.email, emailAddress)).limit(1);
  return row;
}
async function issueToken(table: typeof emailVerificationTokens | typeof passwordResetTokens, userId: string, ttlMs: number) {
  const token = createToken();
  await db.insert(table).values({ userId, tokenHash: await hashToken(token), expiresAt: new Date(Date.now() + ttlMs) });
  return token;
}
export async function createSession(userId: string, impersonatorId?: string) {
  const token = createToken();
  await db.insert(sessions).values({ userId, tokenHash: await hashToken(token), expiresAt: new Date(Date.now() + sessionDurationSeconds * 1000), ipAddress: getRequestIP(), userAgent: getRequestHeader("user-agent"), impersonatorId });
  setCookie(env.SESSION_COOKIE_NAME, token, cookieOptions);
}
export async function currentUser(): Promise<SafeUser | null> {
  const rawToken = getCookie(env.SESSION_COOKIE_NAME);
  if (!rawToken) return null;
  const [row] = await db.select({ id: users.id, email: users.email, role: users.role, status: users.status, emailVerifiedAt: users.emailVerifiedAt, firstName: profiles.firstName, lastName: profiles.lastName, impersonatorId: sessions.impersonatorId }).from(sessions).innerJoin(users, eq(users.id, sessions.userId)).leftJoin(profiles, eq(profiles.userId, users.id)).where(and(eq(sessions.tokenHash, await hashToken(rawToken)), gt(sessions.expiresAt, new Date()))).limit(1);
  if (!row || row.status !== "active") { deleteCookie(env.SESSION_COOKIE_NAME, { path: "/" }); return null; }
  return publicUser(row);
}
export async function requireUser() { const user = await currentUser(); assert(user, 401, "Please sign in to continue."); return user; }
export async function requireAdmin() { const user = await requireUser(); assert((user.role === "admin" || user.role === "super_admin") && !user.impersonatorId, 403, "Administrator access is required."); return user; }
export async function requireSuperAdmin() { const user = await requireUser(); assert(user.role === "super_admin" && !user.impersonatorId, 403, "Super Administrator access is required."); return user; }
export async function register(input: { email: string; password: string; firstName: string; lastName: string }) {
  assert(!(await getUserByEmail(input.email)), 409, "An account with that email already exists.");
  const [user] = await db.insert(users).values({ email: input.email, passwordHash: await hashPassword(input.password) }).returning({ id: users.id, email: users.email });
  await db.insert(profiles).values({ userId: user.id, firstName: input.firstName, lastName: input.lastName });
  await db.insert(notifications).values({ userId: user.id, title: "Welcome to EVOLVE TRADE HUB", body: "Please verify your email to secure your account." });
  try {
    await email.verification(user.email, await issueToken(emailVerificationTokens, user.id, 86_400_000));
  } catch (error) {
    console.error("Failed to send verification email during registration:", error);
  }
}
export async function login(input: { email: string; password: string }) {
  const user = await getUserByEmail(input.email);
  assert(user && (await verifyPassword(input.password, user.passwordHash)), 401, "Invalid email or password.");
  assert(user.status === "active", 403, "This account has been suspended.");
  await createSession(user.id); await db.update(users).set({ lastLoginAt: new Date(), updatedAt: new Date() }).where(eq(users.id, user.id));
  return publicUser(user);
}
export async function logout() { const token = getCookie(env.SESSION_COOKIE_NAME); if (token) await db.delete(sessions).where(eq(sessions.tokenHash, await hashToken(token))); deleteCookie(env.SESSION_COOKIE_NAME, { path: "/" }); }
export async function resendVerification(userId: string, emailAddress: string) {
  await email.verification(emailAddress, await issueToken(emailVerificationTokens, userId, 86_400_000));
}
export async function verifyEmail(token: string) {
  const [record] = await db.select().from(emailVerificationTokens).where(and(eq(emailVerificationTokens.tokenHash, await hashToken(token)), gt(emailVerificationTokens.expiresAt, new Date()), isNull(emailVerificationTokens.usedAt))).limit(1); assert(record, 400, "This verification link is invalid or has expired.");
  await db.transaction(async (tx) => { await tx.update(emailVerificationTokens).set({ usedAt: new Date(), updatedAt: new Date() }).where(eq(emailVerificationTokens.id, record.id)); await tx.update(users).set({ emailVerifiedAt: new Date(), updatedAt: new Date() }).where(eq(users.id, record.userId)); });
}
export async function requestPasswordReset(emailAddress: string) { const user = await getUserByEmail(emailAddress); if (user?.status === "active") await email.passwordReset(user.email, await issueToken(passwordResetTokens, user.id, 3_600_000)); }
export async function resetPassword(token: string, password: string) {
  const [record] = await db.select().from(passwordResetTokens).where(and(eq(passwordResetTokens.tokenHash, await hashToken(token)), gt(passwordResetTokens.expiresAt, new Date()), isNull(passwordResetTokens.usedAt))).limit(1); assert(record, 400, "This password reset link is invalid or has expired.");
  await db.transaction(async (tx) => { await tx.update(passwordResetTokens).set({ usedAt: new Date(), updatedAt: new Date() }).where(eq(passwordResetTokens.id, record.id)); await tx.update(users).set({ passwordHash: await hashPassword(password), updatedAt: new Date() }).where(eq(users.id, record.userId)); await tx.delete(sessions).where(eq(sessions.userId, record.userId)); });
}
export async function recentNotifications(userId: string) { return db.select({ id: notifications.id, title: notifications.title, body: notifications.body, read: notifications.read, createdAt: notifications.createdAt }).from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(20); }
export async function updateProfile(userId: string, input: { firstName: string; lastName: string; phone?: string }) { await db.update(profiles).set({ ...input, phone: input.phone || null, updatedAt: new Date() }).where(eq(profiles.userId, userId)); }

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const [user] = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, userId)).limit(1);
  assert(user, 404, "Account not found.");
  assert(await verifyPassword(currentPassword, user.passwordHash), 401, "Current password is incorrect.");
  const newHash = await hashPassword(newPassword);
  await db.transaction(async (tx) => {
    await tx.update(users).set({ passwordHash: newHash, updatedAt: new Date() }).where(eq(users.id, userId));
  });
}

export async function deleteAccount(userId: string, password: string) {
  const [user] = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, userId)).limit(1);
  assert(user, 404, "Account not found.");
  assert(await verifyPassword(password, user.passwordHash), 401, "Password is incorrect.");
  await db.delete(users).where(eq(users.id, userId));
}

export async function getUserSessions(userId: string) {
  return db.select({
    id: sessions.id,
    ipAddress: sessions.ipAddress,
    userAgent: sessions.userAgent,
    lastSeenAt: sessions.lastSeenAt,
    createdAt: sessions.createdAt,
  }).from(sessions).where(and(eq(sessions.userId, userId), gt(sessions.expiresAt, new Date()))).orderBy(desc(sessions.lastSeenAt)).limit(20);
}

export async function markNotificationRead(userId: string, notificationId: string) {
  await db.update(notifications).set({ read: true }).where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
}

export async function markAllNotificationsRead(userId: string) {
  await db.update(notifications).set({ read: true }).where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
}

export async function getUserActivity(userId: string) {
  return db.select({
    id: auditLogs.id,
    action: auditLogs.action,
    createdAt: auditLogs.createdAt,
    ipAddress: auditLogs.ipAddress,
  }).from(auditLogs).where(eq(auditLogs.actorId, userId)).orderBy(desc(auditLogs.createdAt)).limit(30);
}

export async function revokeOtherSessions(userId: string) {
  const rawToken = getCookie(env.SESSION_COOKIE_NAME);
  if (!rawToken) return;
  const currentHash = await hashToken(rawToken);
  await db.delete(sessions).where(and(eq(sessions.userId, userId), ne(sessions.tokenHash, currentHash)));
}
