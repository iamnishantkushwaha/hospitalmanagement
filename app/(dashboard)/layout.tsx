import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";
import type { UserRole } from "@prisma/client";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // The staff dashboard (patient counts, revenue, bed occupancy, etc.) is not
  // part of the patient app described in the RFP — a patient account should
  // never see it. Send patients back to their own app instead.
  if (session.user.role === "PATIENT") {
    redirect("/patient-app");
  }

  return (
    <AppShell name={session.user.name ?? "User"} role={session.user.role as UserRole}>
      {children}
    </AppShell>
  );
}
