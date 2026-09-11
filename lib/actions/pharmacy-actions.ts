"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function dispensePrescriptionItemAction(prescriptionItemId: string) {
  const item = await db.prescriptionItem.findUnique({ where: { id: prescriptionItemId } });
  if (!item || item.isDispensed || !item.medicineId) return;

  const batch = await db.medicineBatch.findFirst({
    where: { medicineId: item.medicineId, quantity: { gt: 0 } },
    orderBy: { expiryDate: "asc" },
  });
  if (!batch) return;

  await db.$transaction([
    db.medicineBatch.update({ where: { id: batch.id }, data: { quantity: { decrement: 1 } } }),
    db.pharmacyTransaction.create({
      data: { prescriptionItemId: item.id, medicineBatchId: batch.id, quantity: 1 },
    }),
    db.prescriptionItem.update({ where: { id: item.id }, data: { isDispensed: true } }),
  ]);

  revalidatePath("/pharmacy/prescriptions");
  revalidatePath("/pharmacy/medicines");
}
