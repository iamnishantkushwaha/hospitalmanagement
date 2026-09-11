"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { LabOrderStatus } from "@prisma/client";

export async function updateLabOrderStatusAction(orderId: string, status: LabOrderStatus) {
  await db.labOrder.update({ where: { id: orderId }, data: { status } });
  revalidatePath("/laboratory");
  revalidatePath(`/laboratory/orders/${orderId}`);
}

export async function saveLabResultAction(formData: FormData) {
  const orderItemId = String(formData.get("orderItemId"));
  const orderId = String(formData.get("orderId"));
  const resultValue = String(formData.get("resultValue") ?? "");
  const isNormal = formData.get("isNormal") === "on";

  await db.labResult.upsert({
    where: { labOrderItemId: orderItemId },
    update: { resultValue, isNormal, verifiedAt: new Date() },
    create: { labOrderItemId: orderItemId, resultValue, isNormal, verifiedAt: new Date() },
  });

  const items = await db.labOrderItem.findMany({ where: { labOrderId: orderId }, include: { result: true } });
  const allHaveResults = items.every((item) => item.result);
  if (allHaveResults) {
    await db.labOrder.update({ where: { id: orderId }, data: { status: "RESULT_ENTERED" } });
  }

  revalidatePath(`/laboratory/orders/${orderId}`);
  revalidatePath("/laboratory");
}

export async function verifyLabOrderAction(orderId: string) {
  await db.labOrder.update({ where: { id: orderId }, data: { status: "VERIFIED" } });
  const order = await db.labOrder.findUnique({ where: { id: orderId } });
  revalidatePath(`/laboratory/orders/${orderId}`);
  revalidatePath("/laboratory");
  revalidatePath("/laboratory/reports");
  if (order) revalidatePath(`/patients/${order.patientId}/lab-reports`);
}
