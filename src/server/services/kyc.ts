import { eq, desc } from "drizzle-orm";
import { db } from "../db";
import { kycSubmissions, users, profiles } from "../db/schema";
import { requireUser } from "./auth";
import { requireAdmin } from "./auth";

// ─── User-facing ─────────────────────────────────────────────────────────────

export async function submitKyc(input: {
  dateOfBirth: string;
  residenceAddress: string;
  documentType: "drivers_licence" | "passport" | "work_id" | "national_id";
  documentUrl?: string;
}) {
  const user = await requireUser();

  const existing = await db
    .select({ id: kycSubmissions.id, status: kycSubmissions.status })
    .from(kycSubmissions)
    .where(eq(kycSubmissions.userId, user.id))
    .limit(1);

  if (existing.length > 0 && existing[0].status === "approved") {
    throw new Error("Your KYC has already been approved.");
  }

  if (existing.length > 0) {
    // Update existing submission (allow resubmission if rejected or pending)
    await db
      .update(kycSubmissions)
      .set({
        status: "pending",
        dateOfBirth: input.dateOfBirth,
        residenceAddress: input.residenceAddress,
        documentType: input.documentType,
        documentUrl: input.documentUrl ?? null,
        adminNotes: null,
        reviewedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(kycSubmissions.userId, user.id));
  } else {
    await db.insert(kycSubmissions).values({
      userId: user.id,
      status: "pending",
      dateOfBirth: input.dateOfBirth,
      residenceAddress: input.residenceAddress,
      documentType: input.documentType,
      documentUrl: input.documentUrl ?? null,
    });
  }
}

export async function getUserKyc() {
  const user = await requireUser();
  const [kyc] = await db
    .select()
    .from(kycSubmissions)
    .where(eq(kycSubmissions.userId, user.id))
    .limit(1);
  return kyc ?? null;
}

// ─── Admin-facing ─────────────────────────────────────────────────────────────

export async function getAdminKycList() {
  await requireAdmin();
  return db
    .select({
      id: kycSubmissions.id,
      status: kycSubmissions.status,
      dateOfBirth: kycSubmissions.dateOfBirth,
      residenceAddress: kycSubmissions.residenceAddress,
      documentType: kycSubmissions.documentType,
      documentUrl: kycSubmissions.documentUrl,
      adminNotes: kycSubmissions.adminNotes,
      reviewedAt: kycSubmissions.reviewedAt,
      createdAt: kycSubmissions.createdAt,
      user: {
        id: users.id,
        email: users.email,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
      },
    })
    .from(kycSubmissions)
    .innerJoin(users, eq(kycSubmissions.userId, users.id))
    .innerJoin(profiles, eq(users.id, profiles.userId))
    .orderBy(desc(kycSubmissions.createdAt));
}

export async function approveKyc(id: string, notes?: string) {
  const admin = await requireAdmin();
  await db
    .update(kycSubmissions)
    .set({
      status: "approved",
      adminNotes: notes ?? null,
      reviewedAt: new Date(),
      reviewedBy: admin.id,
      updatedAt: new Date(),
    })
    .where(eq(kycSubmissions.id, id));
}

export async function rejectKyc(id: string, notes: string) {
  const admin = await requireAdmin();
  await db
    .update(kycSubmissions)
    .set({
      status: "rejected",
      adminNotes: notes,
      reviewedAt: new Date(),
      reviewedBy: admin.id,
      updatedAt: new Date(),
    })
    .where(eq(kycSubmissions.id, id));
}
