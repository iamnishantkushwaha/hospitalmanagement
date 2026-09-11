import { Users, CalendarCheck, BedDouble, DoorOpen, IndianRupee, FlaskConical, PackageX } from "lucide-react";
import { db } from "@/lib/db";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { AppointmentTrendChart } from "@/components/dashboard/AppointmentTrendChart";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/constants";
import { subDays } from "date-fns";
import type { Appointment, Doctor, Patient, User } from "@prisma/client";

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

type UpcomingAppointment = Appointment & { patient: Patient; doctor: Doctor & { user: User } };

type DashboardData = {
  totalPatients: number;
  todaysAppointments: number;
  activeAdmissions: number;
  availableBeds: number;
  totalBeds: number;
  pendingLabOrders: number;
  lowStockCount: number;
  todaysRevenue: number;
  upcomingAppointments: UpcomingAppointment[];
  recentPatients: Patient[];
  trend: { day: string; appointments: number }[];
  departmentSummary: { name: string; doctors: number; appointments: number }[];
};

async function getDashboardData(): Promise<DashboardData | null> {
  const todayStart = startOfToday();
  const todayEnd = endOfToday();

  try {
    const [
      totalPatients,
      todaysAppointments,
      activeAdmissions,
      availableBeds,
      totalBeds,
      pendingLabOrders,
      medicinesWithBatches,
      todaysPayments,
      upcomingAppointments,
      recentPatients,
      departments,
    ] = await Promise.all([
      db.patient.count(),
      db.appointment.count({ where: { scheduledDate: { gte: todayStart, lte: todayEnd } } }),
      db.admission.count({ where: { status: "ADMITTED" } }),
      db.bed.count({ where: { status: "AVAILABLE" } }),
      db.bed.count(),
      db.labOrder.count({ where: { status: { in: ["ORDERED", "SAMPLE_COLLECTED", "PROCESSING"] } } }),
      db.medicine.findMany({ include: { batches: true } }),
      db.payment.findMany({ where: { paidAt: { gte: todayStart, lte: todayEnd } } }),
      db.appointment.findMany({
        where: { scheduledDate: { gte: todayStart }, status: { in: ["SCHEDULED", "CHECKED_IN"] } },
        orderBy: { scheduledDate: "asc" },
        take: 5,
        include: { patient: true, doctor: { include: { user: true } } },
      }),
      db.patient.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      db.department.findMany({ include: { _count: { select: { doctors: true, appointments: true } } } }),
    ]);

    const lowStockCount = medicinesWithBatches.filter(
      (m) => m.batches.reduce((sum, b) => sum + b.quantity, 0) < 10
    ).length;
    const todaysRevenue = todaysPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    const trendDays = Array.from({ length: 7 }, (_, i) => subDays(todayStart, 6 - i));
    const trendCounts = await Promise.all(
      trendDays.map((day) => {
        const dayEnd = new Date(day);
        dayEnd.setHours(23, 59, 59, 999);
        return db.appointment.count({ where: { scheduledDate: { gte: day, lte: dayEnd } } });
      })
    );
    const trend = trendDays.map((day, i) => ({
      day: day.toLocaleDateString(undefined, { weekday: "short" }),
      appointments: trendCounts[i],
    }));

    const departmentSummary = departments
      .map((d) => ({ name: d.name, doctors: d._count.doctors, appointments: d._count.appointments }))
      .sort((a, b) => b.appointments - a.appointments);

    return {
      totalPatients,
      todaysAppointments,
      activeAdmissions,
      availableBeds,
      totalBeds,
      pendingLabOrders,
      lowStockCount,
      todaysRevenue,
      upcomingAppointments,
      recentPatients,
      trend,
      departmentSummary,
    };
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Operational overview for today.</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
          <p className="font-medium">Database not connected yet.</p>
          <p className="mt-1">
            Set a real <code className="rounded bg-amber-100 px-1 py-0.5">DATABASE_URL</code> in{" "}
            <code className="rounded bg-amber-100 px-1 py-0.5">.env</code>, then run{" "}
            <code className="rounded bg-amber-100 px-1 py-0.5">npx prisma migrate dev</code> and{" "}
            <code className="rounded bg-amber-100 px-1 py-0.5">npx prisma db seed</code> to see live data here.
          </p>
        </div>
      </div>
    );
  }

  const {
    totalPatients,
    todaysAppointments,
    activeAdmissions,
    availableBeds,
    totalBeds,
    pendingLabOrders,
    lowStockCount,
    todaysRevenue,
    upcomingAppointments,
    recentPatients,
    trend,
    departmentSummary,
  } = data;

  const occupiedBeds = totalBeds - availableBeds;
  const occupancyPct = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Operational overview for today.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-7">
        <KpiCard label="Total Patients" value={totalPatients} icon={Users} accent="teal" />
        <KpiCard label="Today's Appointments" value={todaysAppointments} icon={CalendarCheck} accent="sky" />
        <KpiCard label="Active Admissions" value={activeAdmissions} icon={BedDouble} accent="violet" />
        <KpiCard label="Available Beds" value={availableBeds} icon={DoorOpen} accent="amber" />
        <KpiCard label="Pending Lab Reports" value={pendingLabOrders} icon={FlaskConical} accent="rose" />
        <KpiCard label="Low Stock Medicines" value={lowStockCount} icon={PackageX} accent="rose" />
        <KpiCard label="Today's Revenue" value={`₹${todaysRevenue.toLocaleString("en-IN")}`} icon={IndianRupee} accent="teal" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
          <h2 className="mb-1 text-sm font-semibold text-slate-800">Appointment Trend</h2>
          <p className="mb-2 text-xs text-slate-400">Last 7 days</p>
          <AppointmentTrendChart data={trend} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Bed Occupancy</h2>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-slate-900">{occupancyPct}%</span>
            <span className="text-xs text-slate-500">{occupiedBeds} / {totalBeds} beds</span>
          </div>
          <div className="mt-2 h-2.5 w-full rounded-full bg-slate-100">
            <div className="h-2.5 rounded-full bg-violet-600" style={{ width: `${occupancyPct}%` }} />
          </div>
          <div className="mt-4 space-y-1.5 text-xs text-slate-500">
            <div className="flex justify-between"><span>Occupied</span><span className="font-medium text-slate-700">{occupiedBeds}</span></div>
            <div className="flex justify-between"><span>Available</span><span className="font-medium text-slate-700">{availableBeds}</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Upcoming Appointments</h2>
          {upcomingAppointments.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">No upcoming appointments yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {upcomingAppointments.map((appt) => (
                <li key={appt.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-slate-800">
                      {appt.patient.firstName} {appt.patient.lastName}
                    </p>
                    <p className="text-slate-500">Dr. {appt.doctor.user.name} · {appt.timeSlot}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {APPOINTMENT_STATUS_LABELS[appt.status]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Department Summary</h2>
          <ul className="divide-y divide-slate-100">
            {departmentSummary.map((dept) => (
              <li key={dept.name} className="flex items-center justify-between py-2 text-sm">
                <span className="text-slate-700">{dept.name}</span>
                <span className="text-xs text-slate-500">{dept.doctors} doctors · {dept.appointments} appts</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Recent Patient Activity</h2>
          {recentPatients.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">No patients registered yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentPatients.map((patient) => (
                <li key={patient.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-slate-800">
                      {patient.firstName} {patient.lastName}
                    </p>
                    <p className="text-slate-500">{patient.mrn}</p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(patient.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
