import { z } from "zod";

export const appointmentFormSchema = z.object({
  patientId: z.string().min(1, "Select a patient"),
  doctorId: z.string().min(1, "Select a doctor"),
  scheduledDate: z.string().min(1, "Select a date"),
  timeSlot: z.string().min(1, "Select a time slot"),
  reason: z.string().max(300).optional(),
});

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;
