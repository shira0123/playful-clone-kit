import { desc, eq } from "drizzle-orm";
import { db } from "../db";
import { cryptoWallets, investmentPlans, investments } from "../db/schema";
import { requireUser } from "./auth";

export async function getInvestmentPlans() {
  return db.select().from(investmentPlans).where(eq(investmentPlans.isActive, true)).orderBy(investmentPlans.priceAmount);
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

  const userInvestments = await db
    .select({ amount: investments.amount, status: investments.status })
    .from(investments)
    .where(eq(investments.userId, user.id));

  let totalInvested = 0;
  let activeCount = 0;
  let pendingCount = 0;

  for (const inv of userInvestments) {
    if (inv.status === "active" || inv.status === "completed") {
      totalInvested += inv.amount;
    }
    if (inv.status === "active") activeCount++;
    if (inv.status === "pending") pendingCount++;
  }

  return { totalInvested, activeCount, pendingCount };
}
