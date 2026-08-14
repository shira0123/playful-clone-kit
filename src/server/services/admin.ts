import { and, desc, eq, ilike, ne, or, sql } from "drizzle-orm";
import { db } from "../db";
import { auditLogs, profiles, sessions, users } from "../db/schema";
import { createSession, requireAdmin, requestPasswordReset, requireSuperAdmin } from "./auth";

async function audit(actorId: string, action: string, targetUserId?: string) { await db.insert(auditLogs).values({ actorId, targetUserId, action }); }
export async function adminOverview() {
  await requireAdmin();
  const [counts] = await db.select({ users: sql<number>`count(*)`, active: sql<number>`count(*) filter (where ${users.status} = 'active')`, verified: sql<number>`count(*) filter (where ${users.emailVerifiedAt} is not null)` }).from(users);
  return { users: Number(counts?.users ?? 0), active: Number(counts?.active ?? 0), verified: Number(counts?.verified ?? 0) };
}
export async function listUsers(query = "", page = 0) {
  const admin = await requireAdmin(); const term = `%${query.trim()}%`;
  const filter = query ? or(ilike(users.email, term), ilike(profiles.firstName, term), ilike(profiles.lastName, term)) : undefined;
  return db.select({ 
    id: users.id, email: users.email, role: users.role, status: users.status, 
    emailVerifiedAt: users.emailVerifiedAt, createdAt: users.createdAt, 
    firstName: profiles.firstName, lastName: profiles.lastName,
    balance: profiles.balance, totalInvested: profiles.totalInvested,
    profits: profiles.profits, bonus: profiles.bonus, referralCommission: profiles.referralCommission
  }).from(users).leftJoin(profiles, eq(profiles.userId, users.id)).where(and(filter, ne(users.id, admin.id))).orderBy(desc(users.createdAt)).limit(25).offset(page * 25);
}
export async function setUserStatus(targetUserId: string, status: "active" | "suspended") { const admin = await requireAdmin(); await db.update(users).set({ status, updatedAt: new Date() }).where(eq(users.id, targetUserId)); if (status === "suspended") await db.delete(sessions).where(eq(sessions.userId, targetUserId)); await audit(admin.id, `user.${status === "suspended" ? "suspended" : "reactivated"}`, targetUserId); }
export async function verifyUserEmail(targetUserId: string) { const admin = await requireAdmin(); await db.update(users).set({ emailVerifiedAt: new Date(), updatedAt: new Date() }).where(eq(users.id, targetUserId)); await audit(admin.id, "user.email_verified", targetUserId); }
export async function deleteUser(targetUserId: string) { 
  const admin = await requireAdmin();
  const [targetUser] = await db.select({ role: users.role }).from(users).where(eq(users.id, targetUserId));
  if (targetUser?.role === "admin" || targetUser?.role === "super_admin") {
     if (admin.role !== "super_admin") throw new Error("You do not have permission to delete other administrators.");
     if (targetUser.role === "super_admin") throw new Error("This administrator cannot be deleted.");
  }
  await db.delete(users).where(and(eq(users.id, targetUserId), sql`${users.id} <> ${admin.id}`)); 
  await audit(admin.id, "user.deleted", targetUserId); 
}

export async function setUserRole(targetUserId: string, role: "admin" | "user") {
  const admin = await requireSuperAdmin();
  const [target] = await db.select({ role: users.role }).from(users).where(eq(users.id, targetUserId));
  if (!target) throw new Error("User not found.");
  if (target.role === "super_admin") throw new Error("Super Admin role cannot be modified.");
  if (targetUserId === admin.id) throw new Error("Cannot change your own role.");

  await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, targetUserId));
  await audit(admin.id, `user.role_changed_${role}`, targetUserId);
}

export async function updateUserFunds(targetUserId: string, field: "balance" | "profits" | "bonus" | "referralCommission", amount: number, action: "add" | "deduct") {
  const admin = await requireAdmin();
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, targetUserId));
  if (!profile) throw new Error("Profile not found");

  const currentVal = profile[field];
  const newVal = action === "add" ? currentVal + amount : Math.max(0, currentVal - amount);

  await db.update(profiles).set({ [field]: newVal, updatedAt: new Date() }).where(eq(profiles.userId, targetUserId));
  await audit(admin.id, `funds.${action}_${field}`, targetUserId);
}
export async function sendAdminPasswordReset(targetUserId: string) { const admin = await requireAdmin(); const [target] = await db.select({ email: users.email }).from(users).where(eq(users.id, targetUserId)).limit(1); if (target) { try { await requestPasswordReset(target.email); } catch (err: any) { throw new Error(err.message || "Failed to send reset email. Check Resend configuration."); } } await audit(admin.id, "user.password_reset_requested", targetUserId); }
export async function impersonateUser(targetUserId: string) { 
  const admin = await requireAdmin(); 
  await createSession(targetUserId, admin.id); 
  await audit(admin.id, "user.impersonated", targetUserId); 
}

export async function stopImpersonatingUser() {
  const user = await currentUser();
  if (!user?.impersonatorId) {
    throw new Error("You are not currently impersonating anyone.");
  }
  // Restore the admin session
  await createSession(user.impersonatorId);
}
export async function recentAuditLogs() { await requireAdmin(); return db.select({ id: auditLogs.id, action: auditLogs.action, createdAt: auditLogs.createdAt, actorEmail: users.email }).from(auditLogs).leftJoin(users, eq(auditLogs.actorId, users.id)).orderBy(desc(auditLogs.createdAt)).limit(50); }
