import { subDays } from "date-fns";
import { Users, CalendarCheck, BedDouble, FlaskConical, Pill, IndianRupee } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { RevenueChart } from "@/components/reports/RevenueChart";
import { StatusDonut } from "@/components/reports/StatusDonut";
import { HorizontalBarChart } from "@/components/reports/HorizontalBarChart";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/constants";

export default async function ReportsPage() {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const rangeStart = subDays(today, 13);
  rangeStart.setHours(0, 0, 0, 0);

  const [
    totalPatients,
    totalAppointments,
    totalAdmissions,
    labOrderCount,
    pharmacyTxCount,
    payments,
    appointmentsByStatusRaw,
    departments,
    newPatientsThisMonth,
  ] = await Promise.all([
    db.patient.count(),
    db.appointment.count(),
    db.admission.count(),
    db.labOrder.count(),
    db.pharmacyTransaction.count(),
    db.payment.findMany({ where: { paidAt: { gte: rangeStart, lte: today } } }),
    db.appointment.groupBy({ by: ["status"], _count: { _all: true } }),
    db.department.findMany({ include: { _count: { select: { appointments: true } } } }),
    db.patient.count({ where: { createdAt: { gte: new Date(today.getFullYear(), today.getMonth(), 1) } } }),
  ]);

  const revenueByDay = Array.from({ length: 14 }, (_, i) => {
    const day = subDays(today, 13 - i);
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
    const revenue = payments
      .filter((p) => p.paidAt >= dayStart && p.paidAt <= dayEnd)
      .reduce((sum, p) => sum + Number(p.amount), 0);
    return { day: day.toLocaleDateString(undefined, { day: "numeric", month: "short" }), revenue };
  });

  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  const appointmentsByStatus = appointmentsByStatusRaw.map((row) => ({
    name: APPOINTMENT_STATUS_LABELS[row.status] ?? row.status,
    value: row._count._all,
  }));

  const departmentActivity = departments
    .map((d) => ({ name: d.name, value: d._count.appointments }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Operational and financial overview." />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Total Patients" value={totalPatients} icon={Users} accent="teal" />
        <KpiCard label="New This Month" value={newPatientsThisMonth} icon={Users} accent="sky" />
        <KpiCard label="Total Appointments" value={totalAppointments} icon={CalendarCheck} accent="violet" />
        <KpiCard label="Total Admissions" value={totalAdmissions} icon={BedDouble} accent="amber" />
        <KpiCard label="Lab Orders" value={labOrderCount} icon={FlaskConical} accent="rose" />
        <KpiCard label="Pharmacy Sales" value={pharmacyTxCount} icon={Pill} accent="teal" />
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Revenue — Last 14 Days</h2>
          <span className="flex items-center gap-1 text-sm font-semibold text-blue-800">
            <IndianRupee className="h-4 w-4" />
            {totalRevenue.toLocaleString("en-IN")}
          </span>
        </CardHeader>
        <CardBody>
          <RevenueChart data={revenueByDay} />
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-800">Appointments by Status</h2>
          </CardHeader>
          <CardBody>
            <StatusDonut data={appointmentsByStatus} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-800">Department Activity</h2>
          </CardHeader>
          <CardBody>
            <HorizontalBarChart data={departmentActivity} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
