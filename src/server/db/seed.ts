import "dotenv/config";
import { db } from "./index";
import { investmentPlans, cryptoWallets } from "./schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Seeding investment plans...");

  const plans = [
    {
      name: "Starter",
      priceAmount: 200,
      roiDisplay: "5% weekly",
      durationDisplay: "7 days",
      features: ["Instant activation", "24/7 support", "Withdrawal anytime"],
      isPopular: false,
      isActive: true,
    },
    {
      name: "Silver",
      priceAmount: 1000,
      roiDisplay: "8% weekly",
      durationDisplay: "14 days",
      features: ["All Starter benefits", "Dedicated advisor", "Priority execution"],
      isPopular: true,
      isActive: true,
    },
    {
      name: "Gold",
      priceAmount: 5000,
      roiDisplay: "12% weekly",
      durationDisplay: "30 days",
      features: ["All Silver benefits", "Custom strategies", "Quarterly reviews"],
      isPopular: false,
      isActive: true,
    },
    {
      name: "Platinum",
      priceAmount: 25000,
      roiDisplay: "Custom",
      durationDisplay: "Flexible",
      features: ["Bespoke portfolio", "Private banker", "Institutional access"],
      isPopular: false,
      isActive: true,
    },
  ];

  for (const plan of plans) {
    const existing = await db.select().from(investmentPlans).where(eq(investmentPlans.name, plan.name));
    if (existing.length === 0) {
      await db.insert(investmentPlans).values(plan);
      console.log(`Inserted plan: ${plan.name}`);
    } else {
      console.log(`Plan already exists: ${plan.name}`);
    }
  }

  console.log("Seeding crypto wallets...");
  const wallets = [
    {
      network: "Bitcoin (BTC)",
      address: "bc1qdavpssg69079zz0n95wslmdq5n8c6ph8mfs47c",
      isActive: true,
    },
    {
      network: "Ethereum (ETH / ERC-20)",
      address: "0x45cbf1036050454da09562a0633737fc15283ff2",
      isActive: true,
    },
    {
      network: "Tether (USDT / TRC-20)",
      address: "TF4b6HPMoACJiU9CacxMe2zthTxcjf2Bbw",
      isActive: true,
    },
    {
      network: "Tether (USDT / ERC-20)",
      address: "0x45cbf1036050454da09562a0633737fc15283ff2",
      isActive: true,
    },
  ];

  await db.delete(cryptoWallets);
  await db.insert(cryptoWallets).values(wallets);
  console.log("Seeded new crypto wallets.");

  console.log("Seeding complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
