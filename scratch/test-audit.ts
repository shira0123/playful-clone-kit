import "dotenv/config";
import { db } from "../src/server/db";
import { auditLogs, users } from "../src/server/db/schema";

async function run() {
  const adminUser = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.role, "admin") });
  if (!adminUser) throw new Error("No admin user found");
  
  console.log("Found admin:", adminUser.id);
  
  try {
    await db.insert(auditLogs).values({ 
      actorId: adminUser.id, 
      targetUserId: adminUser.id, 
      action: "test.action" 
    });
    console.log("Audit log inserted successfully!");
  } catch (err) {
    console.error("Error inserting audit log:", err);
  }
}

run().catch(console.error);
