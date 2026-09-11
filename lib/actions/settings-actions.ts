"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";

const hospitalSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
});

export type SettingsFormState = { error?: string; success?: boolean } | undefined;

export async function updateHospitalProfileAction(_prevState: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  const parsed = hospitalSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: "Please check the form." };

  await db.hospital.update({
    where: { id: parsed.data.id },
    data: { name: parsed.data.name, address: parsed.data.address, phone: parsed.data.phone, email: parsed.data.email },
  });

  revalidatePath("/settings/hospital");
  return { success: true };
}

const departmentSchema = z.object({
  hospitalId: z.string().min(1),
  name: z.string().min(1, "Department name is required"),
  description: z.string().optional(),
});

export async function createDepartmentAction(_prevState: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  const parsed = departmentSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };

  await db.department.create({ data: parsed.data });
  revalidatePath("/settings/departments");
  return { success: true };
}

export async function toggleUserActiveAction(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return;
  await db.user.update({ where: { id: userId }, data: { isActive: !user.isActive } });
  revalidatePath("/settings/users");
}
