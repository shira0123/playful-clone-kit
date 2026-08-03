import { relations } from "drizzle-orm";
import { boolean, index, inet, integer, jsonb, numeric, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const userRole = pgEnum("user_role", ["user", "admin"]);
export const userStatus = pgEnum("user_status", ["active", "suspended"]);
export const investmentStatus = pgEnum("investment_status", ["pending", "active", "completed", "rejected"]);
export const kycStatus = pgEnum("kyc_status", ["pending", "approved", "rejected"]);
export const kycDocumentType = pgEnum("kyc_document_type", ["drivers_licence", "passport", "work_id", "national_id"]);


export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRole("role").notNull().default("user"),
  status: userStatus("status").notNull().default("active"),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [index("users_email_idx").on(table.email)]);

export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  ...timestamps,
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
  ipAddress: inet("ip_address"),
  userAgent: text("user_agent"),
  impersonatorId: uuid("impersonator_id").references(() => users.id, { onDelete: "set null" }),
  ...timestamps,
}, (table) => [index("sessions_user_id_idx").on(table.userId), index("sessions_expires_at_idx").on(table.expiresAt)]);

export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [index("verification_tokens_user_id_idx").on(table.userId)]);

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [index("password_reset_tokens_user_id_idx").on(table.userId)]);

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
  targetUserId: uuid("target_user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  metadata: jsonb("metadata").notNull().default({}),
  ipAddress: inet("ip_address"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("notifications_user_id_idx").on(table.userId)]);

export const investmentPlans = pgTable("investment_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  priceAmount: integer("price_amount").notNull(),
  roiDisplay: text("roi_display").notNull(),
  durationDisplay: text("duration_display").notNull(),
  features: jsonb("features").notNull().$type<string[]>(),
  isPopular: boolean("is_popular").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
});

export const cryptoWallets = pgTable("crypto_wallets", {
  id: uuid("id").defaultRandom().primaryKey(),
  network: text("network").notNull(),
  address: text("address").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
});

export const investments = pgTable("investments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  planId: uuid("plan_id").notNull().references(() => investmentPlans.id, { onDelete: "restrict" }),
  amount: integer("amount").notNull(),
  cryptoAddressUsed: text("crypto_address_used"),
  status: investmentStatus("status").notNull().default("pending"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [
  index("investments_user_id_idx").on(table.userId),
  index("investments_status_idx").on(table.status),
]);

export const kycSubmissions = pgTable("kyc_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  status: kycStatus("status").notNull().default("pending"),
  dateOfBirth: text("date_of_birth").notNull(),
  residenceAddress: text("residence_address").notNull(),
  documentType: kycDocumentType("document_type").notNull(),
  documentUrl: text("document_url"),
  adminNotes: text("admin_notes"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
  ...timestamps,
}, (table) => [index("kyc_user_id_idx").on(table.userId)]);

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles),
  sessions: many(sessions),
  notifications: many(notifications),
  investments: many(investments),
  kycSubmission: one(kycSubmissions),
}));
export const profilesRelations = relations(profiles, ({ one }) => ({ user: one(users, { fields: [profiles.userId], references: [users.id] }) }));

export const investmentPlansRelations = relations(investmentPlans, ({ many }) => ({
  investments: many(investments),
}));

export const investmentsRelations = relations(investments, ({ one }) => ({
  user: one(users, { fields: [investments.userId], references: [users.id] }),
  plan: one(investmentPlans, { fields: [investments.planId], references: [investmentPlans.id] }),
}));

export const kycRelations = relations(kycSubmissions, ({ one }) => ({
  user: one(users, { fields: [kycSubmissions.userId], references: [users.id] }),
}));

