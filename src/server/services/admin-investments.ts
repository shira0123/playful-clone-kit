import { and, desc, eq, ilike, ne, or } from "drizzle-orm";
import { db } from "../db";
import { investmentPlans, investments, profiles, users, cryptoWallets } from "../db/schema";
import { requireAdmin } from "./auth";

export async function getAllInvestments(query = "", page = 0) {
  const admin = await requireAdmin();
  
  const term = `%${query.trim()}%`;
  const filter = query 
    ? or(ilike(users.email, term), ilike(profiles.firstName, term), ilike(profiles.lastName, term))
    : undefined;

  return db
    .select({
      id: investments.id,
      amount: investments.amount,
      status: investments.status,
      createdAt: investments.createdAt,
      startedAt: investments.startedAt,
      user: {
        email: users.email,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
      },
      plan: {
        name: investmentPlans.name,
      }
    })
    .from(investments)
    .innerJoin(users, eq(investments.userId, users.id))
    .innerJoin(profiles, eq(users.id, profiles.userId))
    .innerJoin(investmentPlans, eq(investments.planId, investmentPlans.id))
    .where(and(filter, ne(users.id, admin.id)))
    .orderBy(desc(investments.createdAt))
    .limit(25)
    .offset(page * 25);
}

export async function approveInvestment(id: string, newAmount?: number) {
  await requireAdmin();
  const [inv] = await db.select().from(investments).where(eq(investments.id, id));
  if (!inv || inv.status !== "pending") throw new Error("Invalid or non-pending investment");

  const [plan] = await db.select().from(investmentPlans).where(eq(investmentPlans.id, inv.planId));
  if (!plan) throw new Error("Investment plan not found");

  const finalAmount = newAmount ?? inv.amount;
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + plan.durationDays);

  await db.update(investments)
    .set({ 
      status: "active",
      amount: finalAmount, 
      startedAt: new Date(),
      expiresAt: expiresAt,
      updatedAt: new Date()
    })
    .where(eq(investments.id, id));

  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, inv.userId));
  if (profile) {
    await db.update(profiles)
      .set({ totalInvested: profile.totalInvested + finalAmount, updatedAt: new Date() })
      .where(eq(profiles.userId, inv.userId));
  }
}

export async function rejectInvestment(id: string) {
  await requireAdmin();
  await db.update(investments)
    .set({ 
      status: "rejected", 
      updatedAt: new Date()
    })
    .where(eq(investments.id, id));
}

export async function cancelInvestment(id: string) {
  await requireAdmin();
  const [inv] = await db.select().from(investments).where(eq(investments.id, id));
  if (!inv) throw new Error("Investment not found");

  await db.update(investments)
    .set({ 
      status: "rejected", 
      updatedAt: new Date()
    })
    .where(eq(investments.id, id));

  if (inv.status === "active") {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, inv.userId));
    if (profile) {
      await db.update(profiles)
        .set({ totalInvested: Math.max(0, profile.totalInvested - inv.amount), updatedAt: new Date() })
        .where(eq(profiles.userId, inv.userId));
    }
  }
}

export async function getAdminInvestmentStats() {
  await requireAdmin();
  
  const allInvestments = await db
    .select({ amount: investments.amount, status: investments.status })
    .from(investments);

  let totalInvested = 0;
  let activeInvestments = 0;
  let pendingApprovals = 0;

  for (const inv of allInvestments) {
    if (inv.status === "active" || inv.status === "completed") {
      totalInvested += inv.amount;
    }
    if (inv.status === "active") activeInvestments++;
    if (inv.status === "pending") pendingApprovals++;
  }

  return { totalInvested, activeInvestments, pendingApprovals };
}

export async function addAdminWallet(network: string, address: string) {
  await requireAdmin();
  await db.insert(cryptoWallets).values({ network, address, isActive: true });
}

export async function updateAdminWallet(id: string, network: string, address: string, isActive: boolean) {
  await requireAdmin();
  await db.update(cryptoWallets)
    .set({ network, address, isActive, updatedAt: new Date() })
    .where(eq(cryptoWallets.id, id));
}

export async function deleteAdminWallet(id: string) {
  await requireAdmin();
  await db.delete(cryptoWallets).where(eq(cryptoWallets.id, id));
}

// ==========================================
// Investment Plans Management
// ==========================================

export async function createInvestmentPlan(data: {
  name: string;
  minAmount: number;
  maxAmount: number;
  roiPercentage: number;
  durationDays: number;
  roiDisplay: string;
  durationDisplay: string;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
}) {
  await requireAdmin();
  const [newPlan] = await db.insert(investmentPlans).values(data).returning();
  return newPlan;
}

export async function updateInvestmentPlan(id: string, data: {
  name?: string;
  minAmount?: number;
  maxAmount?: number;
  roiPercentage?: number;
  durationDays?: number;
  roiDisplay?: string;
  durationDisplay?: string;
  features?: string[];
  isPopular?: boolean;
  isActive?: boolean;
}) {
  await requireAdmin();
  const [updatedPlan] = await db.update(investmentPlans)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(investmentPlans.id, id))
    .returning();
  
  if (!updatedPlan) throw new Error("Plan not found");
  return updatedPlan;
}

export async function deleteInvestmentPlan(id: string) {
  await requireAdmin();
  const activeInvestments = await db.select().from(investments).where(and(eq(investments.planId, id), eq(investments.status, "active"))).limit(1);
  if (activeInvestments.length > 0) {
    throw new Error("Cannot delete plan. There are active investments using this plan. Please deactivate it instead.");
  }
  await db.delete(investmentPlans).where(eq(investmentPlans.id, id));
}
