"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { invoiceFormSchema, invoiceItemSchema, paymentFormSchema } from "@/lib/validations/invoice";

export type InvoiceFormState = { error?: string } | undefined;

export async function createInvoiceAction(_prevState: InvoiceFormState, formData: FormData): Promise<InvoiceFormState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = invoiceFormSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };

  let items: z.infer<typeof invoiceItemSchema>[] = [];
  try {
    items = z.array(invoiceItemSchema).min(1, "Add at least one line item").parse(JSON.parse(parsed.data.items));
  } catch {
    return { error: "Add at least one valid line item." };
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discount = parsed.data.discountAmt ?? 0;
  const total = Math.max(0, subtotal - discount);

  const count = await db.invoice.count();
  const invoice = await db.invoice.create({
    data: {
      invoiceNo: `INV-${String(count + 1).padStart(6, "0")}`,
      patientId: parsed.data.patientId,
      subtotalAmt: subtotal,
      discountAmt: discount,
      totalAmt: total,
      items: {
        create: items.map((item) => ({
          sourceType: "OTHER",
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.quantity * item.unitPrice,
        })),
      },
    },
  });

  revalidatePath("/billing/invoices");
  revalidatePath("/dashboard");
  redirect(`/billing/invoices/${invoice.id}`);
}

export async function recordPaymentAction(formData: FormData) {
  const parsed = paymentFormSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return;

  const invoice = await db.invoice.findUnique({ where: { id: parsed.data.invoiceId }, include: { payments: true } });
  if (!invoice) return;

  await db.payment.create({
    data: { invoiceId: invoice.id, amount: parsed.data.amount, method: parsed.data.method },
  });

  const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0) + parsed.data.amount;
  const status = totalPaid >= Number(invoice.totalAmt) ? "PAID" : "PARTIALLY_PAID";
  await db.invoice.update({ where: { id: invoice.id }, data: { status } });

  revalidatePath(`/billing/invoices/${invoice.id}`);
  revalidatePath("/billing/invoices");
  revalidatePath("/billing/payments");
  revalidatePath(`/patients/${invoice.patientId}/billing`);
  revalidatePath("/dashboard");
}
