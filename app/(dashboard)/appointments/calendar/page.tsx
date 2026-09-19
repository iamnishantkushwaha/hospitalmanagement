import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { addDays, startOfDay, endOfDay } from "date-fns";

export default async function AppointmentCalendarPage() {
  const today = startOfDay(new Date());
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  const appointments = await db.appointment.findMany({
    where: { scheduledDate: { gte: today, lte: endOfDay(addDays(today, 6)) } },
    include: { patient: true, doctor: { include: { user: true } } },
    orderBy: { scheduledDate: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Appointment Calendar" description="Next 7 days across all doctors." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {days.map((day) => {
          const dayAppointments = appointments.filter(
            (a) => startOfDay(a.scheduledDate).getTime() === day.getTime()
          );
          const isToday = day.getTime() === today.getTime();
          return (
            <div key={day.toISOString()} className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className={`border-b border-slate-100 px-3 py-2 ${isToday ? "bg-blue-50" : ""}`}>
                <p className="text-xs font-medium text-slate-500">{day.toLocaleDateString(undefined, { weekday: "short" })}</p>
                <p className={`text-sm font-semibold ${isToday ? "text-blue-800" : "text-slate-800"}`}>
                  {day.toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                </p>
              </div>
              <div className="max-h-80 space-y-2 overflow-y-auto p-2">
                {dayAppointments.length === 0 ? (
                  <p className="px-1 py-4 text-center text-xs text-slate-400">No appointments</p>
                ) : (
                  dayAppointments.map((appt) => (
                    <Link
                      key={appt.id}
                      href={`/patients/${appt.patientId}`}
                      className="block rounded-md border border-slate-100 p-2 text-xs hover:border-blue-200 hover:bg-blue-50"
                    >
                      <p className="font-medium text-slate-700">{appt.timeSlot}</p>
                      <p className="truncate text-slate-600">{appt.patient.firstName} {appt.patient.lastName}</p>
                      <p className="truncate text-slate-400">Dr. {appt.doctor.user.name}</p>
                      <div className="mt-1">
                        <StatusBadge status={appt.status} />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
