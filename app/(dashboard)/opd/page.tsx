import Link from "next/link";
import { ClipboardList, Stethoscope } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AppointmentActions } from "@/components/appointments/AppointmentActions";

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

export default async function OpdQueuePage() {
  const appointments = await db.appointment.findMany({
    where: { scheduledDate: { gte: startOfToday(), lte: endOfToday() } },
    include: { patient: true, doctor: { include: { user: true } } },
    orderBy: { scheduledDate: "asc" },
  });

  const active = appointments.filter((a) => a.status === "SCHEDULED" || a.status === "CHECKED_IN" || a.status === "IN_CONSULTATION");
  const completed = appointments.filter((a) => a.status === "COMPLETED");

  return (
    <div className="space-y-6">
      <PageHeader title="OPD Queue" description="Today's outpatient queue across all doctors." />

      <Card>
        {active.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No patients in queue" description="Checked-in patients will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2.5">Time</th>
                  <th className="px-4 py-2.5">Patient</th>
                  <th className="px-4 py-2.5">Doctor</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {active.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 text-slate-600">{appt.timeSlot}</td>
                    <td className="px-4 py-2.5">
                      <Link href={`/patients/${appt.patientId}`} className="font-medium text-slate-800 hover:text-teal-700">
                        {appt.patient.firstName} {appt.patient.lastName}
                      </Link>
                      <span className="block font-mono text-xs text-slate-400">{appt.patient.mrn}</span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">Dr. {appt.doctor.user.name}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={appt.status} />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <AppointmentActions appointmentId={appt.id} status={appt.status} />
                        {appt.status === "IN_CONSULTATION" && (
                          <Link
                            href={`/opd/consultation/${appt.id}`}
                            className="inline-flex items-center gap-1 rounded-md bg-teal-600 px-2 py-1 text-xs font-medium text-white hover:bg-teal-700"
                          >
                            <Stethoscope className="h-3 w-3" />
                            Open Consultation
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {completed.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Completed Today ({completed.length})</h2>
          <Card>
            <ul className="divide-y divide-slate-100">
              {completed.map((appt) => (
                <li key={appt.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <Link href={`/patients/${appt.patientId}`} className="font-medium text-slate-700 hover:text-teal-700">
                    {appt.patient.firstName} {appt.patient.lastName}
                  </Link>
                  <span className="text-slate-500">Dr. {appt.doctor.user.name} · {appt.timeSlot}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
