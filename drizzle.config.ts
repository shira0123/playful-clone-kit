import { defineConfig } from "drizzle-kit";
import fs from "fs";
import path from "path";

if (!process.env.DATABASE_URL) {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const [key, ...vals] = trimmed.split("=");
          const k = key.trim();
          const v = vals.join("=").trim().replace(/^["']|["']$/g, "");
          if (k && !process.env[k]) {
            process.env[k] = v;
          }
        }
      }
    }
  } catch {}
}

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
