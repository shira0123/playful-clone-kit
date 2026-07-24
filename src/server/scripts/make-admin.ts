import "dotenv/config";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Please provide an email address. Usage: npx tsx src/server/scripts/make-admin.ts <email>");
    process.exit(1);
  }

  const result = await db.update(users).set({ role: "admin" }).where(eq(users.email, email)).returning();
  
  if (result.length > 0) {
    console.log(`Success! User ${email} has been promoted to admin.`);
  } else {
    console.error(`User ${email} not found.`);
  }
  process.exit(0);
}

main().catch(console.error);
