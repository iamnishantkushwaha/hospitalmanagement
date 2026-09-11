import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { AdmissionForm } from "@/components/ipd/AdmissionForm";

export default async function NewAdmissionPage() {
  const [patients, doctors, beds] = await Promise.all([
    db.patient.findMany({ orderBy: { firstName: "asc" }, select: { id: true, firstName: true, lastName: true, mrn: true } }),
    db.doctor.findMany({ orderBy: { user: { name: "asc" } }, include: { user: true } }),
    db.bed.findMany({ where: { status: "AVAILABLE" }, include: { room: { include: { ward: true } } }, orderBy: { bedNo: "asc" } }),
  ]);

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="New Admission" description="Admit a patient and allocate a bed." />
      <AdmissionForm patients={patients} doctors={doctors} beds={beds} />
    </div>
  );
}
