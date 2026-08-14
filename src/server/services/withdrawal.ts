import { desc, eq } from "drizzle-orm";
import { db } from "../db";
import { profiles, users, withdrawalRequests } from "../db/schema";
import { requireAdmin, requireUser } from "./auth";

export async function requestWithdrawal(amount: number, cryptoNetwork: string, walletAddress: string) {
  const user = await requireUser();

  // Begin transaction to ensure atomic balance update and request creation
  return db.transaction(async (tx) => {
    const [profile] = await tx.select().from(profiles).where(eq(profiles.userId, user.id));
    if (!profile) throw new Error("Profile not found.");
    if (profile.balance < amount) throw new Error("Insufficient balance.");

    // Deduct from balance
    await tx.update(profiles)
      .set({ 
        balance: profile.balance - amount, 
        updatedAt: new Date() 
      })
      .where(eq(profiles.userId, user.id));

    // Create withdrawal request
    const [request] = await tx.insert(withdrawalRequests)
      .values({
        userId: user.id,
        amount,
        cryptoNetwork,
        walletAddress,
        status: "pending",
      })
      .returning();

    return request;
  });
}

export async function getUserWithdrawals() {
  const user = await requireUser();
  return db.select().from(withdrawalRequests).where(eq(withdrawalRequests.userId, user.id)).orderBy(desc(withdrawalRequests.createdAt));
}

export async function getAdminWithdrawals() {
  await requireAdmin();
  return db
    .select({
      id: withdrawalRequests.id,
      userId: withdrawalRequests.userId,
      amount: withdrawalRequests.amount,
      cryptoNetwork: withdrawalRequests.cryptoNetwork,
      walletAddress: withdrawalRequests.walletAddress,
      status: withdrawalRequests.status,
      adminNotes: withdrawalRequests.adminNotes,
      createdAt: withdrawalRequests.createdAt,
      reviewedAt: withdrawalRequests.reviewedAt,
      user: {
        email: users.email,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
      }
    })
    .from(withdrawalRequests)
    .innerJoin(users, eq(users.id, withdrawalRequests.userId))
    .leftJoin(profiles, eq(profiles.userId, withdrawalRequests.userId))
    .orderBy(desc(withdrawalRequests.createdAt));
}

export async function adminUpdateWithdrawal(id: string, status: "approved" | "rejected", adminNotes?: string) {
  const admin = await requireAdmin();

  return db.transaction(async (tx) => {
    const [request] = await tx.select().from(withdrawalRequests).where(eq(withdrawalRequests.id, id));
    if (!request) throw new Error("Withdrawal request not found.");
    if (request.status !== "pending") throw new Error("Request is already processed.");

    if (status === "rejected") {
      // Refund user balance
      const [profile] = await tx.select().from(profiles).where(eq(profiles.userId, request.userId));
      if (profile) {
        await tx.update(profiles).set({ 
          balance: profile.balance + request.amount, 
          updatedAt: new Date() 
        }).where(eq(profiles.userId, request.userId));
      }
    } else if (status === "approved") {
      // Add to totalWithdrawal
      const [profile] = await tx.select().from(profiles).where(eq(profiles.userId, request.userId));
      if (profile) {
        await tx.update(profiles).set({ 
          totalWithdrawal: (profile.totalWithdrawal || 0) + request.amount,
          updatedAt: new Date() 
        }).where(eq(profiles.userId, request.userId));
      }
    }

    await tx.update(withdrawalRequests).set({
      status,
      adminNotes,
      reviewedBy: admin.id,
      reviewedAt: new Date()
    }).where(eq(withdrawalRequests.id, id));
  });
}
