"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { appointmentFormSchema } from "@/lib/validations/appointment";
import type { AppointmentStatus } from "@prisma/client";

export type AppointmentFormState = { error?: string; fieldErrors?: Record<string, string> } | undefined;

export async function createAppointmentAction(_prevState: AppointmentFormState, formData: FormData): Promise<AppointmentFormState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = appointmentFormSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }

  const data = parsed.data;
  const doctor = await db.doctor.findUnique({ where: { id: data.doctorId } });
  if (!doctor) return { error: "Selected doctor was not found." };

  const count = await db.appointment.count();
  const appointmentNo = `APT-${String(count + 1).padStart(6, "0")}`;

  let appointmentId: string;
  try {
    const appointment = await db.appointment.create({
      data: {
        appointmentNo,
        patientId: data.patientId,
        doctorId: data.doctorId,
        departmentId: doctor.departmentId,
        scheduledDate: new Date(data.scheduledDate),
        timeSlot: data.timeSlot,
        reason: data.reason || undefined,
      },
    });
    appointmentId = appointment.id;
  } catch (error) {
    console.error(error);
    return { error: "Could not create appointment. Please try again." };
  }

  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  redirect(`/appointments?created=${appointmentId}`);
}

export async function updateAppointmentStatusAction(appointmentId: string, status: AppointmentStatus) {
  await db.appointment.update({ where: { id: appointmentId }, data: { status } });
  revalidatePath("/appointments");
  revalidatePath("/opd");
  revalidatePath("/dashboard");
}
