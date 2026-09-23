"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function getOwnPatientId() {
  const session = await auth();
  if (!session?.user || session.user.role !== "PATIENT") {
    throw new Error("Not authorized.");
  }
  const patient = await db.patient.findUnique({ where: { userId: session.user.id } });
  if (!patient) throw new Error("No patient record is linked to this account.");
  return patient.id;
}

function newAppointmentNo() {
  return `APT-${Date.now().toString(36).toUpperCase()}`;
}

export type PortalActionState = { error?: string; success?: string } | undefined;

export async function bookAppointmentAction(
  _prevState: PortalActionState,
  formData: FormData
): Promise<PortalActionState> {
  try {
    const patientId = await getOwnPatientId();
    const doctorId = formData.get("doctorId") as string;
    const date = formData.get("date") as string;
    const timeSlot = (formData.get("timeSlot") as string)?.trim();
    const reason = (formData.get("reason") as string)?.trim() || undefined;

    if (!doctorId || !date || !timeSlot) {
      return { error: "Choose a doctor, date and time." };
    }
    if (new Date(date) < new Date(new Date().toDateString())) {
      return { error: "Pick a date from today onward." };
    }

    const doctor = await db.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) return { error: "That doctor could not be found." };

    await db.appointment.create({
      data: {
        appointmentNo: newAppointmentNo(),
        patientId,
        doctorId,
        departmentId: doctor.departmentId,
        scheduledDate: new Date(date),
        timeSlot,
        reason,
      },
    });

    revalidatePath("/patient-app");
    return { success: "Appointment booked." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not book the appointment." };
  }
}

export async function rescheduleAppointmentAction(
  _prevState: PortalActionState,
  formData: FormData
): Promise<PortalActionState> {
  try {
    const patientId = await getOwnPatientId();
    const appointmentId = formData.get("appointmentId") as string;
    const date = formData.get("date") as string;
    const timeSlot = (formData.get("timeSlot") as string)?.trim();

    if (!appointmentId || !date || !timeSlot) {
      return { error: "Pick a new date and time." };
    }

    const appointment = await db.appointment.findUnique({ where: { id: appointmentId } });
    if (!appointment || appointment.patientId !== patientId) {
      return { error: "That appointment could not be found." };
    }
    if (appointment.status !== "SCHEDULED") {
      return { error: "Only scheduled appointments can be rescheduled." };
    }

    await db.appointment.update({
      where: { id: appointmentId },
      data: { scheduledDate: new Date(date), timeSlot },
    });

    revalidatePath("/patient-app");
    return { success: "Appointment rescheduled." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not reschedule." };
  }
}

export async function cancelAppointmentAction(appointmentId: string): Promise<void> {
  const patientId = await getOwnPatientId();
  const appointment = await db.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment || appointment.patientId !== patientId) {
    throw new Error("That appointment could not be found.");
  }
  if (appointment.status !== "SCHEDULED" && appointment.status !== "CHECKED_IN") {
    throw new Error("This appointment can no longer be cancelled.");
  }

  await db.appointment.update({ where: { id: appointmentId }, data: { status: "CANCELLED" } });
  revalidatePath("/patient-app");
}

export async function addFamilyMemberAction(
  _prevState: PortalActionState,
  formData: FormData
): Promise<PortalActionState> {
  try {
    const patientId = await getOwnPatientId();
    const name = (formData.get("name") as string)?.trim();
    const relation = (formData.get("relation") as string)?.trim() || undefined;
    const phone = (formData.get("phone") as string)?.trim() || undefined;

    if (!name) return { error: "Name is required." };

    await db.patientContact.create({ data: { patientId, name, relation, phone } });
    revalidatePath("/patient-app");
    return { success: "Family member added." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not add family member." };
  }
}

export async function payInvoiceAction(invoiceId: string): Promise<void> {
  const patientId = await getOwnPatientId();
  const invoice = await db.invoice.findUnique({ where: { id: invoiceId }, include: { payments: true } });
  if (!invoice || invoice.patientId !== patientId) {
    throw new Error("That invoice could not be found.");
  }
  if (invoice.status === "PAID" || invoice.status === "CANCELLED") return;

  const paidSoFar = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const due = Number(invoice.totalAmt) - paidSoFar;
  if (due <= 0) return;

  await db.payment.create({ data: { invoiceId, amount: due, method: "UPI" } });
  await db.invoice.update({ where: { id: invoiceId }, data: { status: "PAID" } });

  revalidatePath("/patient-app");
}
