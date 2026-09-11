import { Pill } from "lucide-react";
import { db } from "@/lib/db";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function PatientPrescriptionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const prescriptions = await db.prescription.findMany({
    where: { patientId: id },
    include: { doctor: { include: { user: true } }, items: true },
    orderBy: { createdAt: "desc" },
  });

  if (prescriptions.length === 0) {
    return (
      <Card>
        <EmptyState icon={Pill} title="No prescriptions yet" description="Prescriptions issued during consultations will appear here." />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {prescriptions.map((rx) => (
        <Card key={rx.id}>
          <CardHeader className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">Dr. {rx.doctor.user.name}</p>
              <p className="text-xs text-slate-500">{rx.createdAt.toLocaleDateString()}</p>
            </div>
          </CardHeader>
          <CardBody>
            <ul className="divide-y divide-slate-100">
              {rx.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="font-medium text-slate-800">{item.medicineName}</p>
                    <p className="text-slate-500">
                      {item.dosage} · {item.frequency} · {item.durationDays} days
                      {item.instructions ? ` · ${item.instructions}` : ""}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                      item.isDispensed ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {item.isDispensed ? "Dispensed" : "Pending"}
                  </span>
                </li>
              ))}
            </ul>
            {rx.notes && <p className="mt-2 text-xs text-slate-500">Note: {rx.notes}</p>}
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
