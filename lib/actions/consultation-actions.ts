"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { consultationFormSchema, prescriptionItemSchema } from "@/lib/validations/consultation";
import { z } from "zod";

export type ConsultationFormState = { error?: string } | undefined;

export async function createConsultationAction(_prevState: ConsultationFormState, formData: FormData): Promise<ConsultationFormState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = consultationFormSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const data = parsed.data;

  const appointment = await db.appointment.findUnique({ where: { id: data.appointmentId } });
  if (!appointment) return { error: "Appointment not found." };

  let prescriptionItems: z.infer<typeof prescriptionItemSchema>[] = [];
  try {
    const rawItems = data.prescriptionItems ? JSON.parse(data.prescriptionItems) : [];
    prescriptionItems = z.array(prescriptionItemSchema).parse(rawItems);
  } catch {
    return { error: "Invalid prescription items." };
  }

  let labTestIds: string[] = [];
  try {
    labTestIds = data.labTestIds ? z.array(z.string()).parse(JSON.parse(data.labTestIds)) : [];
  } catch {
    return { error: "Invalid lab test selection." };
  }

  const medicines = prescriptionItems.length
    ? await db.medicine.findMany({ where: { id: { in: prescriptionItems.map((i) => i.medicineId) } } })
    : [];
  const medicineById = new Map(medicines.map((m) => [m.id, m]));

  const consultation = await db.consultation.create({
    data: {
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      chiefComplaint: data.chiefComplaint || undefined,
      clinicalNotes: data.clinicalNotes || undefined,
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
      vitals: {
        create: [
          {
            temperatureC: data.temperatureC,
            bloodPressure: data.bloodPressure || undefined,
            pulseBpm: data.pulseBpm,
            respRate: data.respRate,
            weightKg: data.weightKg,
            heightCm: data.heightCm,
            spo2: data.spo2,
          },
        ],
      },
      diagnoses: { create: [{ description: data.diagnosis }] },
    },
  });

  if (prescriptionItems.length > 0) {
    await db.prescription.create({
      data: {
        consultationId: consultation.id,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        items: {
          create: prescriptionItems.map((item) => ({
            medicineId: item.medicineId,
            medicineName: medicineById.get(item.medicineId)?.name ?? "Unknown medicine",
            dosage: item.dosage,
            frequency: item.frequency,
            durationDays: item.durationDays,
            instructions: item.instructions || undefined,
          })),
        },
      },
    });
  }

  if (labTestIds.length > 0) {
    const count = await db.labOrder.count();
    await db.labOrder.create({
      data: {
        orderNo: `LAB-${String(count + 1).padStart(6, "0")}`,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        consultationId: consultation.id,
        tests: { create: labTestIds.map((labTestId) => ({ labTestId })) },
      },
    });
  }

  await db.appointment.update({ where: { id: appointment.id }, data: { status: "COMPLETED" } });

  revalidatePath("/opd");
  revalidatePath("/appointments");
  revalidatePath(`/patients/${appointment.patientId}`);
  revalidatePath("/dashboard");
  redirect(`/patients/${appointment.patientId}/medical-records`);
}
