import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppointmentForm } from "@/components/appointments/AppointmentForm";

export default async function NewAppointmentPage() {
  const [patients, doctors] = await Promise.all([
    db.patient.findMany({ orderBy: { firstName: "asc" }, select: { id: true, firstName: true, lastName: true, mrn: true } }),
    db.doctor.findMany({
      orderBy: { user: { name: "asc" } },
      include: { user: true, department: true },
    }),
  ]);

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="New Appointment" description="Schedule a patient visit with a doctor." />
      <AppointmentForm patients={patients} doctors={doctors} />
    </div>
  );
}
