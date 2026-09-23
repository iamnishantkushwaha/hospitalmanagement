"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";
import { db } from "@/lib/db";

export type LoginState = { error?: string } | undefined;

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get("email") as string | null;
  const password = formData.get("password");
  const callbackUrl = (formData.get("callbackUrl") as string) || "/dashboard";

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }

  // Patients land straight on the mobile app demo (phone frame) instead of the
  // staff dashboard; everyone else goes to their normal destination.
  const user = email ? await db.user.findUnique({ where: { email }, select: { role: true } }) : null;
  const target = user?.role === "PATIENT" ? "/patient-app" : callbackUrl;

  redirect(target);
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
