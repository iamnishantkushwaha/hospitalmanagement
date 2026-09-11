"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { patientFormSchema } from "@/lib/validations/patient";

export type PatientFormState = { error?: string; fieldErrors?: Record<string, string> } | undefined;

async function nextMrn(): Promise<string> {
  const count = await db.patient.count();
  return `PAT-${String(count + 1).padStart(6, "0")}`;
}

export async function createPatientAction(_prevState: PatientFormState, formData: FormData): Promise<PatientFormState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = patientFormSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }

  const data = parsed.data;
  let patientId: string | undefined;

  for (let attempt = 0; attempt < 3 && !patientId; attempt++) {
    try {
      const mrn = await nextMrn();
      const patient = await db.patient.create({
        data: {
          mrn,
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
          gender: data.gender,
          bloodGroup: data.bloodGroup || undefined,
          phone: data.phone || undefined,
          email: data.email || undefined,
          address: data.address || undefined,
          allergies: data.allergies || undefined,
          existingConditions: data.existingConditions || undefined,
          contacts: data.emergencyContactName
            ? { create: [{ name: data.emergencyContactName, phone: data.emergencyContactPhone, relation: "Emergency Contact" }] }
            : undefined,
        },
      });
      patientId = patient.id;
    } catch (error: unknown) {
      if (attempt === 2) {
        console.error(error);
        return { error: "Could not register patient. Please try again." };
      }
    }
  }

  revalidatePath("/patients");
  redirect(`/patients/${patientId}`);
}
