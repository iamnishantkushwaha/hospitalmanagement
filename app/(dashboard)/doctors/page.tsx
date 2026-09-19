import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function DoctorsPage() {
  const doctors = await db.doctor.findMany({
    include: { user: true, department: true, _count: { select: { appointments: true } } },
    orderBy: { user: { name: "asc" } },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Doctors" description={`${doctors.length} doctors across all departments`} />

      {doctors.length === 0 ? (
        <Card>
          <EmptyState icon={Stethoscope} title="No doctors yet" />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <Link key={doctor.id} href={`/doctors/${doctor.id}`}>
              <Card className="h-full transition hover:border-blue-300 hover:shadow-md">
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700">
                      {doctor.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">Dr. {doctor.user.name}</p>
                      <p className="truncate text-xs text-slate-500">{doctor.specialization}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5">{doctor.department.name}</span>
                    <span>{doctor.experienceYears} yrs exp</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                    <span className="text-slate-500">Fee: ₹{Number(doctor.consultationFee).toLocaleString("en-IN")}</span>
                    <span className="font-medium text-blue-800">{doctor._count.appointments} appts</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
