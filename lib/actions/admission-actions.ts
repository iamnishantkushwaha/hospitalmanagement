"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { admissionFormSchema } from "@/lib/validations/admission";

export type AdmissionFormState = { error?: string; fieldErrors?: Record<string, string> } | undefined;

export async function createAdmissionAction(_prevState: AdmissionFormState, formData: FormData): Promise<AdmissionFormState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = admissionFormSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }

  const data = parsed.data;
  const bed = await db.bed.findUnique({ where: { id: data.bedId } });
  if (!bed || bed.status !== "AVAILABLE") return { error: "Selected bed is no longer available." };

  const count = await db.admission.count();
  const admissionNo = `ADM-${String(count + 1).padStart(6, "0")}`;

  await db.admission.create({
    data: {
      admissionNo,
      patientId: data.patientId,
      doctorId: data.doctorId,
      bedId: data.bedId,
      reason: data.reason || undefined,
      dailyChargeAmt: data.dailyChargeAmt,
    },
  });

  await db.bed.update({ where: { id: data.bedId }, data: { status: "OCCUPIED" } });

  revalidatePath("/ipd/admissions");
  revalidatePath("/ipd/beds");
  revalidatePath("/dashboard");
  redirect(`/patients/${data.patientId}`);
}

export async function dischargeAdmissionAction(admissionId: string) {
  const admission = await db.admission.findUnique({ where: { id: admissionId } });
  if (!admission || admission.status !== "ADMITTED") return;

  const days = Math.max(1, Math.ceil((Date.now() - admission.admissionDate.getTime()) / (24 * 60 * 60 * 1000)));
  const dailyCharge = Number(admission.dailyChargeAmt ?? 0);

  await db.$transaction([
    db.admission.update({ where: { id: admissionId }, data: { status: "DISCHARGED" } }),
    db.bed.update({ where: { id: admission.bedId }, data: { status: "AVAILABLE" } }),
    db.discharge.create({
      data: { admissionId, summary: "Patient discharged in stable condition." },
    }),
  ]);

  if (dailyCharge > 0) {
    const invoiceCount = await db.invoice.count();
    const subtotal = dailyCharge * days;
    await db.invoice.create({
      data: {
        invoiceNo: `INV-${String(invoiceCount + 1).padStart(6, "0")}`,
        patientId: admission.patientId,
        subtotalAmt: subtotal,
        totalAmt: subtotal,
        items: {
          create: [{ sourceType: "ROOM", description: `Room charges (${days} day${days === 1 ? "" : "s"})`, quantity: days, unitPrice: dailyCharge, amount: subtotal }],
        },
      },
    });
  }

  revalidatePath("/ipd/admissions");
  revalidatePath("/ipd/beds");
  revalidatePath(`/patients/${admission.patientId}`);
  revalidatePath("/dashboard");
}
