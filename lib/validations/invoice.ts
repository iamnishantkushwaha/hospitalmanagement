import { z } from "zod";

export const invoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
  unitPrice: z.coerce.number().min(0),
});

export const invoiceFormSchema = z.object({
  patientId: z.string().min(1, "Select a patient"),
  discountAmt: z.coerce.number().min(0).optional(),
  items: z.string().min(1),
});

export const paymentFormSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.coerce.number().positive("Enter a valid amount"),
  method: z.enum(["CASH", "CARD", "UPI", "INSURANCE", "OTHER"]),
});
