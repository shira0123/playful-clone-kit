import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().url().optional(),
  APP_URL: z.string().url().default("http://localhost:3000"),
  SESSION_COOKIE_NAME: z.string().min(1).default("evolve_session"),
  EMAIL_FROM: z.string().min(3).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export const env = schema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  APP_URL: process.env.APP_URL,
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME,
  EMAIL_FROM: process.env.EMAIL_FROM,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  NODE_ENV: process.env.NODE_ENV,
});

export function requireDatabaseUrl(): string {
  if (!env.DATABASE_URL) throw new Error("DATABASE_URL is required to use the backend.");
  return env.DATABASE_URL;
}
