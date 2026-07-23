import { AppError } from "./errors";

const attempts = new Map<string, { count: number; resetAt: number }>();
export function enforceRateLimit(key: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= now) { attempts.set(key, { count: 1, resetAt: now + windowMs }); return; }
  if (entry.count >= limit) throw new AppError(429, "Too many requests. Please try again shortly.");
  entry.count += 1;
}
