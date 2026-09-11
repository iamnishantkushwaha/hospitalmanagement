import { z } from "zod";

export const admissionFormSchema = z.object({
  patientId: z.string().min(1, "Select a patient"),
  doctorId: z.string().min(1, "Select a doctor"),
  bedId: z.string().min(1, "Select a bed"),
  reason: z.string().max(300).optional(),
  dailyChargeAmt: z.coerce.number().min(0, "Enter a valid amount"),
});

export type AdmissionFormValues = z.infer<typeof admissionFormSchema>;
