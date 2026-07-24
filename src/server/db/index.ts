import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { requireDatabaseUrl } from "../config";
import * as schema from "./schema";

let instance: ReturnType<typeof drizzle<typeof schema>> | undefined;

function getDb() {
  if (!instance) {
    const url = requireDatabaseUrl();
    const needsSsl = url.includes("supabase.com") || url.includes("sslmode=require");
    const client = postgres(url, {
      prepare: false,
      max: 10,
      ...(needsSsl ? { ssl: "require" } : {}),
    });
    instance = drizzle(client, { schema });
  }
  return instance;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  },
});
