import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/start-server-core/request-response";
import { z } from "zod";
import * as admin from "./server/services/admin";
import * as auth from "./server/services/auth";
import { enforceRateLimit } from "./server/lib/rate-limit";

const email = z.string().trim().toLowerCase().email().max(254);
const password = z.string().min(12, "Use at least 12 characters.").max(128).regex(/[a-z]/, "Include a lowercase letter.").regex(/[A-Z]/, "Include an uppercase letter.").regex(/[0-9]/, "Include a number.");
const identity = z.object({ firstName: z.string().trim().min(1).max(80), lastName: z.string().trim().min(1).max(80) });
const limiterKey = (action: string) => `${action}:${getRequestIP() ?? "unknown"}`;

export const registerUser = createServerFn({ method: "POST" }).validator(identity.extend({ email, password })).handler(async ({ data }) => { enforceRateLimit(limiterKey("register"), 5, 60_000); await auth.register(data as { email: string; password: string; firstName: string; lastName: string }); return { ok: true }; });
export const loginUser = createServerFn({ method: "POST" }).validator(z.object({ email, password: z.string().min(1).max(128) })).handler(async ({ data }) => { enforceRateLimit(limiterKey("login"), 10, 60_000); return auth.login(data as { email: string; password: string }); });
export const logoutUser = createServerFn({ method: "POST" }).handler(async () => { await auth.logout(); return { ok: true }; });
export const getCurrentUser = createServerFn({ method: "GET" }).handler(() => auth.currentUser());
export const verifyUserEmail = createServerFn({ method: "POST" }).validator(z.object({ token: z.string().min(32).max(200) })).handler(async ({ data }) => { await auth.verifyEmail(data.token); return { ok: true }; });
export const forgotPassword = createServerFn({ method: "POST" }).validator(z.object({ email })).handler(async ({ data }) => { enforceRateLimit(limiterKey("forgot-password"), 5, 60_000); await auth.requestPasswordReset(data.email); return { ok: true }; });
export const resetPassword = createServerFn({ method: "POST" }).validator(z.object({ token: z.string().min(32).max(200), password })).handler(async ({ data }) => { await auth.resetPassword(data.token, data.password); return { ok: true }; });
export const getNotifications = createServerFn({ method: "GET" }).handler(async () => { const user = await auth.requireUser(); return auth.recentNotifications(user.id); });
export const saveProfile = createServerFn({ method: "POST" }).validator(identity.extend({ phone: z.string().trim().max(32).optional() })).handler(async ({ data }) => { const user = await auth.requireUser(); await auth.updateProfile(user.id, data as { firstName: string; lastName: string; phone?: string }); return { ok: true }; });

export const changeUserPassword = createServerFn({ method: "POST" })
  .validator(z.object({ currentPassword: z.string().min(1).max(128), newPassword: password }))
  .handler(async ({ data }) => {
    const user = await auth.requireUser();
    await auth.changePassword(user.id, data.currentPassword, data.newPassword);
    return { ok: true };
  });

export const deleteUserAccount = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string().min(1).max(128) }))
  .handler(async ({ data }) => {
    const user = await auth.requireUser();
    await auth.deleteAccount(user.id, data.password);
    await auth.logout();
    return { ok: true };
  });

export const getUserSessions = createServerFn({ method: "GET" })
  .handler(async () => {
    const user = await auth.requireUser();
    return auth.getUserSessions(user.id);
  });

export const markNotificationRead = createServerFn({ method: "POST" })
  .validator(z.object({ notificationId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const user = await auth.requireUser();
    await auth.markNotificationRead(user.id, data.notificationId);
    return { ok: true };
  });

export const markAllNotificationsRead = createServerFn({ method: "POST" })
  .handler(async () => {
    const user = await auth.requireUser();
    await auth.markAllNotificationsRead(user.id);
    return { ok: true };
  });

export const getUserActivity = createServerFn({ method: "GET" })
  .handler(async () => {
    const user = await auth.requireUser();
    return auth.getUserActivity(user.id);
  });

export const revokeOtherSessions = createServerFn({ method: "POST" })
  .handler(async () => {
    const user = await auth.requireUser();
    await auth.revokeOtherSessions(user.id);
    return { ok: true };
  });

const userId = z.object({ userId: z.string().uuid() });
export const getAdminOverview = createServerFn({ method: "GET" }).handler(() => admin.adminOverview());
export const getAdminUsers = createServerFn({ method: "GET" }).validator(z.object({ query: z.string().max(100).optional(), page: z.number().int().min(0).max(1000).optional() })).handler(({ data }) => admin.listUsers(data.query, data.page));
export const changeAdminUserStatus = createServerFn({ method: "POST" }).validator(userId.extend({ status: z.enum(["active", "suspended"]) })).handler(async ({ data }) => { await admin.setUserStatus(data.userId, data.status); return { ok: true }; });
export const adminVerifyEmail = createServerFn({ method: "POST" }).validator(userId).handler(async ({ data }) => { await admin.verifyUserEmail(data.userId); return { ok: true }; });
export const adminDeleteUser = createServerFn({ method: "POST" }).validator(userId).handler(async ({ data }) => { await admin.deleteUser(data.userId); return { ok: true }; });
export const adminResetPassword = createServerFn({ method: "POST" }).validator(userId).handler(async ({ data }) => { await admin.sendAdminPasswordReset(data.userId); return { ok: true }; });
export const adminImpersonateUser = createServerFn({ method: "POST" }).validator(userId).handler(async ({ data }) => { await admin.impersonateUser(data.userId); return { ok: true }; });
export const getAuditLogs = createServerFn({ method: "GET" }).handler(() => admin.recentAuditLogs());

import * as investment from "./server/services/investment";
import * as adminInvestment from "./server/services/admin-investments";

export const getInvestmentPlans = createServerFn({ method: "GET" }).handler(() => investment.getInvestmentPlans());
export const getCryptoWallets = createServerFn({ method: "GET" }).handler(() => investment.getCryptoWallets());
export const submitInvestment = createServerFn({ method: "POST" }).validator(z.object({ planId: z.string().uuid(), amount: z.number().min(1) })).handler(async ({ data }) => { return investment.submitInvestment(data.planId, data.amount); });
export const getUserInvestments = createServerFn({ method: "GET" }).handler(() => investment.getUserInvestments());
export const getPortfolioStats = createServerFn({ method: "GET" }).handler(() => investment.getPortfolioStats());

export const getAdminInvestments = createServerFn({ method: "GET" }).validator(z.object({ query: z.string().max(100).optional(), page: z.number().int().min(0).max(1000).optional() })).handler(({ data }) => adminInvestment.getAllInvestments(data.query, data.page));
export const approveInvestment = createServerFn({ method: "POST" }).validator(z.object({ id: z.string().uuid() })).handler(async ({ data }) => { await adminInvestment.approveInvestment(data.id); return { ok: true }; });
export const rejectInvestment = createServerFn({ method: "POST" }).validator(z.object({ id: z.string().uuid() })).handler(async ({ data }) => { await adminInvestment.rejectInvestment(data.id); return { ok: true }; });
export const cancelInvestment = createServerFn({ method: "POST" }).validator(z.object({ id: z.string().uuid() })).handler(async ({ data }) => { await adminInvestment.cancelInvestment(data.id); return { ok: true }; });
export const getAdminInvestmentStats = createServerFn({ method: "GET" }).handler(() => adminInvestment.getAdminInvestmentStats());

export const addAdminWallet = createServerFn({ method: "POST" }).validator(z.object({ network: z.string().min(1), address: z.string().min(1) })).handler(async ({ data }) => { await adminInvestment.addAdminWallet(data.network, data.address); return { ok: true }; });
export const updateAdminWallet = createServerFn({ method: "POST" }).validator(z.object({ id: z.string().uuid(), network: z.string().min(1), address: z.string().min(1), isActive: z.boolean() })).handler(async ({ data }) => { await adminInvestment.updateAdminWallet(data.id, data.network, data.address, data.isActive); return { ok: true }; });
export const deleteAdminWallet = createServerFn({ method: "POST" }).validator(z.object({ id: z.string().uuid() })).handler(async ({ data }) => { await adminInvestment.deleteAdminWallet(data.id); return { ok: true }; });

export const resendVerificationEmail = createServerFn({ method: "POST" }).handler(async () => {
  const user = await auth.requireUser();
  if (user.emailVerified) throw new Error("Email is already verified");
  await auth.resendVerification(user.id, user.email);
  return { ok: true };
});
