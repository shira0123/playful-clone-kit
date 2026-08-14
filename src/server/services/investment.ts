import { desc, eq } from "drizzle-orm";
import { db } from "../db";
import { cryptoWallets, investmentPlans, investments, profiles } from "../db/schema";
import { requireUser } from "./auth";

export async function getInvestmentPlans() {
  return db.select().from(investmentPlans).where(eq(investmentPlans.isActive, true)).orderBy(investmentPlans.minAmount);
}

export async function getCryptoWallets() {
  return db.select().from(cryptoWallets).where(eq(cryptoWallets.isActive, true));
}

export async function submitInvestment(planId: string, amount: number) {
  const user = await requireUser();
  
  const [newInvestment] = await db
    .insert(investments)
    .values({
      userId: user.id,
      planId,
      amount,
      status: "pending",
    })
    .returning();

  return newInvestment;
}

export async function getUserInvestments() {
  const user = await requireUser();
  
  return db
    .select({
      id: investments.id,
      amount: investments.amount,
      status: investments.status,
      startedAt: investments.startedAt,
      expiresAt: investments.expiresAt,
      createdAt: investments.createdAt,
      plan: {
        name: investmentPlans.name,
        roiDisplay: investmentPlans.roiDisplay,
        durationDisplay: investmentPlans.durationDisplay,
      }
    })
    .from(investments)
    .innerJoin(investmentPlans, eq(investments.planId, investmentPlans.id))
    .where(eq(investments.userId, user.id))
    .orderBy(desc(investments.createdAt));
}

export async function getPortfolioStats() {
  const user = await requireUser();
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id));
  
  const userInvestments = await db
    .select({ status: investments.status })
    .from(investments)
    .where(eq(investments.userId, user.id));

  let activeCount = 0;
  let pendingCount = 0;

  for (const inv of userInvestments) {
    if (inv.status === "active") activeCount++;
    if (inv.status === "pending") pendingCount++;
  }

  return { 
    balance: profile?.balance || 0,
    totalInvested: profile?.totalInvested || 0,
    totalWithdrawal: profile?.totalWithdrawal || 0,
    profits: profile?.profits || 0,
    bonus: profile?.bonus || 0,
    referralCommission: profile?.referralCommission || 0,
    activeCount, 
    pendingCount 
  };
}

export async function processDailyRoi() {
  const activeInvestments = await db.select({
    id: investments.id,
    userId: investments.userId,
    amount: investments.amount,
    currentProfit: investments.currentProfit,
    planId: investments.planId,
    expiresAt: investments.expiresAt,
  }).from(investments).where(eq(investments.status, "active"));

  if (activeInvestments.length === 0) {
    return { count: 0 };
  }

  // Group by user
  const userProfits = new Map<string, number>();
  
  for (const inv of activeInvestments) {
    const [plan] = await db.select().from(investmentPlans).where(eq(investmentPlans.id, inv.planId));
    if (!plan) continue;

    // Daily ROI = amount * (roiPercentage / 100), rounded to whole cents
    const dailyProfit = Math.round(inv.amount * (plan.roiPercentage / 100));
    
    // Check if the investment has reached its expiration date
    const isExpired = inv.expiresAt && new Date() >= new Date(inv.expiresAt);

    await db.update(investments).set({
      currentProfit: (inv.currentProfit || 0) + dailyProfit,
      status: isExpired ? "completed" : "active",
      updatedAt: new Date()
    }).where(eq(investments.id, inv.id));

    userProfits.set(inv.userId, (userProfits.get(inv.userId) || 0) + dailyProfit);
  }

  for (const [userId, profit] of userProfits.entries()) {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    if (profile) {
      await db.update(profiles).set({
        profits: (profile.profits || 0) + profit,
        balance: (profile.balance || 0) + profit,
        updatedAt: new Date()
      }).where(eq(profiles.userId, userId));
    }
  }

  return { count: activeInvestments.length };
}
