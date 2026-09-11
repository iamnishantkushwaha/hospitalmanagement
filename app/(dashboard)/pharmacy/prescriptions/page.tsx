import Link from "next/link";
import { Pill } from "lucide-react";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { DispenseButton } from "@/components/pharmacy/DispenseButton";

export default async function PharmacyPrescriptionsPage() {
  const items = await db.prescriptionItem.findMany({
    where: { isDispensed: false },
    include: { prescription: { include: { patient: true, doctor: { include: { user: true } } } } },
    orderBy: { id: "desc" },
    take: 100,
  });

  return (
    <Card>
      {items.length === 0 ? (
        <EmptyState icon={Pill} title="Queue is clear" description="No pending medicines to dispense." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-4 py-2.5">Patient</th>
                <th className="px-4 py-2.5">Doctor</th>
                <th className="px-4 py-2.5">Medicine</th>
                <th className="px-4 py-2.5">Dosage</th>
                <th className="px-4 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5">
                    <Link href={`/patients/${item.prescription.patientId}`} className="font-medium text-slate-800 hover:text-teal-700">
                      {item.prescription.patient.firstName} {item.prescription.patient.lastName}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">Dr. {item.prescription.doctor.user.name}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-800">{item.medicineName}</td>
                  <td className="px-4 py-2.5 text-slate-600">{item.dosage} · {item.frequency} · {item.durationDays}d</td>
                  <td className="px-4 py-2.5">
                    <DispenseButton prescriptionItemId={item.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
