import "dotenv/config";
import { db } from "./index";
import { users } from "./schema";

/**
 * DANGER: Deletes ALL users (and cascaded data) from the database.
 * Investment plans and crypto wallets are preserved.
 * Run with: npx tsx src/server/db/clear-users.ts
 */
async function clearUsers() {
  console.log("⚠️  Deleting all users from database...");
  const deleted = await db.delete(users).returning({ id: users.id, email: users.email });
  console.log(`✅  Deleted ${deleted.length} user(s):`);
  for (const u of deleted) console.log(`   - ${u.email} (${u.id})`);
  console.log("\nDone. Run the seed script to recreate the admin account:");
  console.log("  npx tsx src/server/db/seed.ts");
  process.exit(0);
}

clearUsers().catch((err) => {
  console.error("❌  Failed:", err);
  process.exit(1);
});
