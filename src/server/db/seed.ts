import "dotenv/config";
import { db } from "./index";
import { investmentPlans, cryptoWallets } from "./schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Seeding investment plans...");

  const plans = [
    {
      name: "Beginners Plan",
      priceAmount: 200,
      roiDisplay: "3% Daily",
      durationDisplay: "24 Hours",
      features: [
        "Min: $200",
        "Max: $3,999",
        "R.O.I: 3% Daily",
        "Duration: 24hrs",
        "Referral Bonus: 2%",
        "24/7 Support: Yes"
      ],
      isPopular: false,
      isActive: true,
    },
    {
      name: "Standard Plan",
      priceAmount: 5000,
      roiDisplay: "5% Daily for 5 Days",
      durationDisplay: "5 Days",
      features: [
        "Min: $5,000",
        "Max: $9,999",
        "R.O.I: 5% Daily",
        "Duration: 5 Days",
        "Referral Bonus: 4%",
        "24/7 Support: Yes"
      ],
      isPopular: true,
      isActive: true,
    },
    {
      name: "Advanced Plan",
      priceAmount: 10000,
      roiDisplay: "8% Daily for 21 Days",
      durationDisplay: "21 Days",
      features: [
        "Min: $10,000",
        "Max: $29,000",
        "R.O.I: 8% Daily",
        "Duration: 21 Days",
        "Referral Bonus: 4%",
        "24/7 Support: Yes"
      ],
      isPopular: false,
      isActive: true,
    },
    {
      name: "Professional Plan",
      priceAmount: 30000,
      roiDisplay: "12% Daily",
      durationDisplay: "Optional",
      features: [
        "Min: $30,000",
        "Max: Unlimited",
        "R.O.I: 12% Daily",
        "Duration: Optional",
        "Referral Bonus: 4%",
        "24/7 Support: Yes"
      ],
      isPopular: false,
      isActive: true,
    },
  ];

  const { investments } = await import("./schema");
  await db.delete(investments);
  await db.delete(investmentPlans);
  for (const plan of plans) {
    await db.insert(investmentPlans).values(plan);
    console.log(`Inserted plan: ${plan.name}`);
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
