import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Stethoscope } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export default async function DoctorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const doctor = await db.doctor.findUnique({
    where: { id },
    include: { user: true, department: true },
  });

  if (!doctor) notFound();

  const [todaysAppointments, recentConsultations] = await Promise.all([
    db.appointment.findMany({
      where: { doctorId: id, scheduledDate: { gte: startOfToday(), lte: endOfToday() } },
      include: { patient: true },
      orderBy: { scheduledDate: "asc" },
    }),
    db.consultation.findMany({
      where: { doctorId: id },
      include: { patient: true, diagnoses: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title={`Dr. ${doctor.user.name}`} description={doctor.specialization} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-800">Profile</h2>
          </CardHeader>
          <CardBody className="space-y-2 text-sm">
            <Row label="Department" value={doctor.department.name} />
            <Row label="Qualification" value={doctor.qualification ?? "—"} />
            <Row label="Experience" value={`${doctor.experienceYears ?? 0} years`} />
            <Row label="Consultation Fee" value={`₹${Number(doctor.consultationFee).toLocaleString("en-IN")}`} />
            <Row label="Working Days" value={doctor.workingDays.join(", ")} />
            <Row label="Slot Hours" value={`${doctor.slotStartTime} - ${doctor.slotEndTime}`} />
            <Row label="Email" value={doctor.user.email} />
          </CardBody>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-slate-800">Today&apos;s Appointments</h2>
            </CardHeader>
            <CardBody>
              {todaysAppointments.length === 0 ? (
                <EmptyState icon={CalendarDays} title="No appointments today" />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {todaysAppointments.map((appt) => (
                    <li key={appt.id} className="flex items-center justify-between py-2 text-sm">
                      <div>
                        <Link href={`/patients/${appt.patientId}`} className="font-medium text-slate-800 hover:text-teal-700">
                          {appt.patient.firstName} {appt.patient.lastName}
                        </Link>
                        <p className="text-slate-500">{appt.timeSlot}</p>
                      </div>
                      <StatusBadge status={appt.status} />
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-slate-800">Recent Consultations</h2>
            </CardHeader>
            <CardBody>
              {recentConsultations.length === 0 ? (
                <EmptyState icon={Stethoscope} title="No consultations yet" />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {recentConsultations.map((c) => (
                    <li key={c.id} className="py-2 text-sm">
                      <div className="flex items-center justify-between">
                        <Link href={`/patients/${c.patientId}`} className="font-medium text-slate-800 hover:text-teal-700">
                          {c.patient.firstName} {c.patient.lastName}
                        </Link>
                        <span className="text-xs text-slate-400">{c.createdAt.toLocaleDateString()}</span>
                      </div>
                      {c.diagnoses[0] && <p className="text-slate-500">{c.diagnoses[0].description}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-800">{value}</span>
    </div>
  );
}
