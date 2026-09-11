import { z } from "zod";

export const patientFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(80),
  lastName: z.string().min(1, "Last name is required").max(80),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  bloodGroup: z.string().max(5).optional(),
  phone: z.string().min(7, "Enter a valid phone number").max(20).optional().or(z.literal("")),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  address: z.string().max(300).optional(),
  allergies: z.string().max(300).optional(),
  existingConditions: z.string().max(300).optional(),
  emergencyContactName: z.string().max(120).optional(),
  emergencyContactPhone: z.string().max(20).optional(),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;
