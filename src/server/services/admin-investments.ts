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

export async function approveInvestment(id: string) {
  await requireAdmin();
  await db.update(investments)
    .set({ 
      status: "active", 
      startedAt: new Date(),
      updatedAt: new Date()
    })
    .where(eq(investments.id, id));
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
  await db.update(investments)
    .set({ 
      status: "rejected", 
      updatedAt: new Date()
    })
    .where(eq(investments.id, id));
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
