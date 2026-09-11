import { z } from "zod";

export const prescriptionItemSchema = z.object({
  medicineId: z.string().min(1),
  dosage: z.string().min(1).max(60),
  frequency: z.string().min(1).max(20),
  durationDays: z.coerce.number().int().min(1).max(90),
  instructions: z.string().max(120).optional(),
});

export const consultationFormSchema = z.object({
  appointmentId: z.string().min(1),
  chiefComplaint: z.string().max(300).optional(),
  clinicalNotes: z.string().max(1000).optional(),
  diagnosis: z.string().min(1, "Diagnosis is required").max(300),
  followUpDate: z.string().optional(),
  temperatureC: z.coerce.number().optional(),
  bloodPressure: z.string().max(20).optional(),
  pulseBpm: z.coerce.number().int().optional(),
  respRate: z.coerce.number().int().optional(),
  weightKg: z.coerce.number().optional(),
  heightCm: z.coerce.number().optional(),
  spo2: z.coerce.number().int().optional(),
  prescriptionItems: z.string().optional(),
  labTestIds: z.string().optional(),
});

export type ConsultationFormValues = z.infer<typeof consultationFormSchema>;
