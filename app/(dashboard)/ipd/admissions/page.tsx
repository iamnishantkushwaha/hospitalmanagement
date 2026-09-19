import Link from "next/link";
import { BedDouble, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DischargeButton } from "@/components/ipd/DischargeButton";

export default async function AdmissionsPage() {
  const admissions = await db.admission.findMany({
    include: { patient: true, doctor: { include: { user: true } }, bed: { include: { room: { include: { ward: true } } } } },
    orderBy: { admissionDate: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link
          href="/ipd/admissions/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          <Plus className="h-4 w-4" />
          New Admission
        </Link>
      </div>

      <Card>
        {admissions.length === 0 ? (
          <EmptyState icon={BedDouble} title="No admissions yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2.5">Admission No.</th>
                  <th className="px-4 py-2.5">Patient</th>
                  <th className="px-4 py-2.5">Doctor</th>
                  <th className="px-4 py-2.5">Ward / Bed</th>
                  <th className="px-4 py-2.5">Admitted On</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {admissions.map((adm) => (
                  <tr key={adm.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{adm.admissionNo}</td>
                    <td className="px-4 py-2.5">
                      <Link href={`/patients/${adm.patientId}`} className="font-medium text-slate-800 hover:text-blue-800">
                        {adm.patient.firstName} {adm.patient.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">Dr. {adm.doctor.user.name}</td>
                    <td className="px-4 py-2.5 text-slate-600">
                      {adm.bed.room.ward.name} · {adm.bed.bedNo}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">{adm.admissionDate.toLocaleDateString()}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={adm.status} />
                    </td>
                    <td className="px-4 py-2.5">
                      {adm.status === "ADMITTED" && <DischargeButton admissionId={adm.id} />}
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
