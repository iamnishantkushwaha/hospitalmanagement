import { CalendarDays } from "lucide-react";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default async function PatientAppointmentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const appointments = await db.appointment.findMany({
    where: { patientId: id },
    include: { doctor: { include: { user: true } }, department: true },
    orderBy: { scheduledDate: "desc" },
  });

  if (appointments.length === 0) {
    return (
      <Card>
        <EmptyState icon={CalendarDays} title="No appointments yet" description="This patient has no appointment history." />
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-2.5">Date</th>
              <th className="px-4 py-2.5">Time</th>
              <th className="px-4 py-2.5">Doctor</th>
              <th className="px-4 py-2.5">Department</th>
              <th className="px-4 py-2.5">Reason</th>
              <th className="px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {appointments.map((appt) => (
              <tr key={appt.id} className="hover:bg-slate-50">
                <td className="px-4 py-2.5 text-slate-700">{appt.scheduledDate.toLocaleDateString()}</td>
                <td className="px-4 py-2.5 text-slate-600">{appt.timeSlot}</td>
                <td className="px-4 py-2.5 text-slate-800">Dr. {appt.doctor.user.name}</td>
                <td className="px-4 py-2.5 text-slate-600">{appt.department.name}</td>
                <td className="px-4 py-2.5 text-slate-600">{appt.reason ?? "—"}</td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={appt.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
