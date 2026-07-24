import { z } from "zod";

/** Treat empty strings as undefined so optional fields pass validation */
const optionalString = z.string().transform((s) => (s === "" ? undefined : s)).pipe(z.string().min(1).optional());

const schema = z.object({
  DATABASE_URL: z.string().transform((s) => (s === "" ? undefined : s)).pipe(z.string().url().optional()),
  APP_URL: z.string().url().default("http://localhost:3000"),
  SESSION_COOKIE_NAME: z.string().min(1).default("evolve_session"),
  EMAIL_FROM: optionalString,
  RESEND_API_KEY: optionalString,
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
  const url = process.env.DATABASE_URL || env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Please create a .env file with DATABASE_URL=postgres://user:password@localhost:5432/dbname",
    );
  }
  return url;
}

