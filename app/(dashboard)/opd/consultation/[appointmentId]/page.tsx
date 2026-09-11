import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { ConsultationForm } from "@/components/opd/ConsultationForm";

export default async function ConsultationWorkspacePage({ params }: { params: Promise<{ appointmentId: string }> }) {
  const { appointmentId } = await params;

  const [appointment, medicines, labTests] = await Promise.all([
    db.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: true, doctor: { include: { user: true } } },
    }),
    db.medicine.findMany({ orderBy: { name: "asc" } }),
    db.labTest.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!appointment) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title="Consultation" description={`${appointment.patient.firstName} ${appointment.patient.lastName} · ${appointment.patient.mrn}`} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1 h-fit">
          <CardBody className="space-y-2 text-sm">
            <h2 className="mb-1 text-sm font-semibold text-slate-800">Patient Summary</h2>
            <Row label="Name" value={`${appointment.patient.firstName} ${appointment.patient.lastName}`} />
            <Row label="MRN" value={appointment.patient.mrn} />
            <Row label="Gender" value={appointment.patient.gender ?? "—"} />
            <Row label="Blood Group" value={appointment.patient.bloodGroup ?? "—"} />
            <Row label="Allergies" value={appointment.patient.allergies ?? "None recorded"} />
            <Row label="Conditions" value={appointment.patient.existingConditions ?? "None recorded"} />
            <Row label="Doctor" value={`Dr. ${appointment.doctor.user.name}`} />
            <Row label="Reason" value={appointment.reason ?? "—"} />
          </CardBody>
        </Card>

        <div className="lg:col-span-2">
          <ConsultationForm appointmentId={appointment.id} medicines={medicines} labTests={labTests} />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-slate-50 py-1 last:border-none">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-800">{value}</span>
    </div>
  );
}
