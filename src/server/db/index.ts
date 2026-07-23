import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { requireDatabaseUrl } from "../config";
import * as schema from "./schema";

const client = postgres(requireDatabaseUrl(), { prepare: false, max: 10 });
export const db = drizzle(client, { schema });
