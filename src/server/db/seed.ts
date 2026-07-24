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
      address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      isActive: true,
    },
    {
      network: "Ethereum (ETH / ERC-20)",
      address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      isActive: true,
    },
    {
      network: "Tether (USDT / TRC-20)",
      address: "T9zX3QyYw4g4v9rN3mJ2kL3pX7qV8cW9hM",
      isActive: true,
    },
  ];

  for (const wallet of wallets) {
    const existing = await db.select().from(cryptoWallets).where(eq(cryptoWallets.network, wallet.network));
    if (existing.length === 0) {
      await db.insert(cryptoWallets).values(wallet);
      console.log(`Inserted wallet: ${wallet.network}`);
    } else {
      console.log(`Wallet already exists: ${wallet.network}`);
    }
  }

  console.log("Seeding complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
