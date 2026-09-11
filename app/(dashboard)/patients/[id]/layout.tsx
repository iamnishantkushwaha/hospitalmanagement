import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PatientHeader } from "@/components/patients/PatientHeader";
import { PatientTabs } from "@/components/patients/PatientTabs";

export default async function PatientDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await db.patient.findUnique({ where: { id } });

  if (!patient) notFound();

  return (
    <div className="space-y-4">
      <PatientHeader patient={patient} />
      <PatientTabs patientId={patient.id} />
      <div>{children}</div>
    </div>
  );
}
