"use server";

import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth, signIn } from "@/lib/auth";

const OTP_PURPOSE = "SELF_REGISTRATION";
const OTP_TTL_MS = 5 * 60 * 1000;

export type SendOtpState = { error?: string; success?: boolean; devOtp?: string } | undefined;

export async function sendRegistrationOtpAction(_prevState: SendOtpState, formData: FormData): Promise<SendOtpState> {
  const phone = (formData.get("phone") as string)?.trim();
  const dob = formData.get("dob") as string;
  const firstName = (formData.get("firstName") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();

  if (!phone || !/^\d{10}$/.test(phone)) return { error: "Enter a valid 10-digit mobile number." };
  if (!dob) return { error: "Enter your date of birth." };
  if (!firstName || !lastName) return { error: "Enter your full name." };

  const code = "123456";

  await db.otpCode.create({
    data: { phone, code, purpose: OTP_PURPOSE, expiresAt: new Date(Date.now() + OTP_TTL_MS) },
  });

  // No SMS gateway is wired up in this demo (the RFP lists that as a
  // separately procured third-party licence). The code is returned directly
  // so the self-registration flow can still be exercised end to end.
  return { success: true, devOtp: code };
}

export type VerifyOtpState = { error?: string; matched?: boolean } | undefined;

export async function verifyRegistrationOtpAction(_prevState: VerifyOtpState, formData: FormData): Promise<VerifyOtpState> {
  const phone = (formData.get("phone") as string)?.trim();
  const otp = (formData.get("otp") as string)?.trim();
  const dob = formData.get("dob") as string;
  const firstName = (formData.get("firstName") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();

  if (!phone || !otp || !dob || !firstName || !lastName) {
    return { error: "Something went wrong — please start again." };
  }

  const record = await db.otpCode.findFirst({
    where: { phone, purpose: OTP_PURPOSE, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!record || record.code !== otp) {
    return { error: "That code is incorrect or has expired." };
  }

  await db.otpCode.update({ where: { id: record.id }, data: { consumedAt: new Date() } });

  const dobDate = new Date(dob);
  const dayStart = new Date(dobDate);
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date(dobDate);
  dayEnd.setUTCHours(23, 59, 59, 999);

  const syntheticEmail = `patient.${phone}@self.local`;
  const rawPassword = randomUUID();
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  let user = await db.user.findUnique({ where: { email: syntheticEmail } });
  if (!user) {
    user = await db.user.create({
      data: { email: syntheticEmail, name: `${firstName} ${lastName}`, role: "PATIENT", passwordHash },
    });
  } else {
    // Rotate the password each time so we can always sign this session in
    // below, whether this is a first registration or a repeat attempt.
    user = await db.user.update({ where: { id: user.id }, data: { passwordHash } });
  }

  let matched = false;

  const alreadyLinked = await db.patient.findUnique({ where: { userId: user.id } });
  if (alreadyLinked) {
    matched = true;
  } else {
    const existingPatient = await db.patient.findFirst({
      where: { phone, dateOfBirth: { gte: dayStart, lte: dayEnd }, userId: null },
    });

    if (existingPatient) {
      await db.patient.update({ where: { id: existingPatient.id }, data: { userId: user.id } });
      matched = true;
    } else {
      await db.pendingPatientRegistration.upsert({
        where: { userId: user.id },
        update: { firstName, lastName, phone, dateOfBirth: dobDate, status: "PENDING" },
        create: { userId: user.id, firstName, lastName, phone, dateOfBirth: dobDate },
      });
    }
  }

  await signIn("credentials", { email: syntheticEmail, password: rawPassword, redirect: false });
  redirect("/patient-app");
}

// ---------------------------------------------------------------------------
// Reception-side manual merge
// ---------------------------------------------------------------------------

async function requireFrontOfficeSession() {
  const session = await auth();
  if (!session?.user || !["ADMIN", "RECEPTIONIST"].includes(session.user.role)) {
    throw new Error("Not authorized.");
  }
}

export type LinkRegistrationState = { error?: string; success?: string } | undefined;

export async function linkPendingRegistrationAction(
  _prevState: LinkRegistrationState,
  formData: FormData
): Promise<LinkRegistrationState> {
  try {
    await requireFrontOfficeSession();

    const pendingId = formData.get("pendingId") as string;
    const mrn = (formData.get("mrn") as string)?.trim();
    if (!mrn) return { error: "Enter the patient's MRN to link." };

    const pending = await db.pendingPatientRegistration.findUnique({ where: { id: pendingId } });
    if (!pending || pending.status !== "PENDING") return { error: "This request is no longer pending." };

    const patient = await db.patient.findUnique({ where: { mrn } });
    if (!patient) return { error: "No patient found with that MRN." };
    if (patient.userId) return { error: "That patient record is already linked to a login." };

    await db.patient.update({
      where: { id: patient.id },
      data: { userId: pending.userId, phone: patient.phone ?? pending.phone },
    });
    await db.pendingPatientRegistration.update({ where: { id: pendingId }, data: { status: "MERGED" } });

    revalidatePath("/patient-registrations");
    return { success: `Linked to ${patient.mrn}.` };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not link this registration." };
  }
}

export async function createPatientFromPendingAction(pendingId: string): Promise<void> {
  await requireFrontOfficeSession();

  const pending = await db.pendingPatientRegistration.findUnique({ where: { id: pendingId } });
  if (!pending || pending.status !== "PENDING") throw new Error("This request is no longer pending.");

  await db.patient.create({
    data: {
      mrn: `PAT-N${Date.now().toString(36).toUpperCase()}`,
      firstName: pending.firstName,
      lastName: pending.lastName,
      dateOfBirth: pending.dateOfBirth,
      phone: pending.phone,
      userId: pending.userId,
    },
  });
  await db.pendingPatientRegistration.update({ where: { id: pendingId }, data: { status: "MERGED" } });

  revalidatePath("/patient-registrations");
}
