import Link from "next/link";
import { CalendarDays, CalendarPlus, CalendarRange } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AppointmentActions } from "@/components/appointments/AppointmentActions";
import { cn } from "@/lib/utils";
import type { AppointmentStatus, Prisma } from "@prisma/client";

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

const RANGES = [
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "all", label: "All" },
] as const;

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; status?: string }>;
}) {
  const { range = "today", status } = await searchParams;

  const where: Prisma.AppointmentWhereInput = {};
  if (range === "today") where.scheduledDate = { gte: startOfToday(), lte: endOfToday() };
  else if (range === "upcoming") where.scheduledDate = { gt: endOfToday() };
  else if (range === "past") where.scheduledDate = { lt: startOfToday() };
  if (status) where.status = status as AppointmentStatus;

  const appointments = await db.appointment.findMany({
    where,
    include: { patient: true, doctor: { include: { user: true } }, department: true },
    orderBy: { scheduledDate: range === "past" ? "desc" : "asc" },
    take: 150,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description={`${appointments.length} appointment${appointments.length === 1 ? "" : "s"}`}
        action={
          <div className="flex gap-2">
            <Link
              href="/appointments/calendar"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <CalendarRange className="h-4 w-4" />
              Calendar
            </Link>
            <Link
              href="/appointments/new"
              className="inline-flex items-center gap-1.5 rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              <CalendarPlus className="h-4 w-4" />
              New Appointment
            </Link>
          </div>
        }
      />

      <div className="flex gap-1.5 rounded-lg border border-slate-200 bg-white p-1 w-fit">
        {RANGES.map((r) => (
          <Link
            key={r.key}
            href={`/appointments?range=${r.key}`}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition",
              range === r.key ? "bg-teal-600 text-white" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            {r.label}
          </Link>
        ))}
      </div>

      <Card>
        {appointments.length === 0 ? (
          <EmptyState icon={CalendarDays} title="No appointments found" description="Try a different range or create a new appointment." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2.5">Date / Time</th>
                  <th className="px-4 py-2.5">Patient</th>
                  <th className="px-4 py-2.5">Doctor</th>
                  <th className="px-4 py-2.5">Department</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 text-slate-700">
                      {appt.scheduledDate.toLocaleDateString()}
                      <span className="block text-xs text-slate-400">{appt.timeSlot}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <Link href={`/patients/${appt.patientId}`} className="font-medium text-slate-800 hover:text-teal-700">
                        {appt.patient.firstName} {appt.patient.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">
                      <Link href={`/doctors/${appt.doctorId}`} className="hover:text-teal-700">
                        Dr. {appt.doctor.user.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{appt.department.name}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={appt.status} />
                    </td>
                    <td className="px-4 py-2.5">
                      <AppointmentActions appointmentId={appt.id} status={appt.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
