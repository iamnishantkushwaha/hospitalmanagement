import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LabOrderActions } from "@/components/laboratory/LabOrderActions";

export default async function LabOrdersPage() {
  const orders = await db.labOrder.findMany({
    include: { patient: true, doctor: { include: { user: true } }, tests: { include: { labTest: true } } },
    orderBy: { orderedAt: "desc" },
    take: 100,
  });

  return (
    <Card>
      {orders.length === 0 ? (
        <EmptyState icon={FlaskConical} title="No lab orders yet" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-4 py-2.5">Order No.</th>
                <th className="px-4 py-2.5">Patient</th>
                <th className="px-4 py-2.5">Doctor</th>
                <th className="px-4 py-2.5">Tests</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5">
                    <Link href={`/laboratory/orders/${order.id}`} className="font-mono text-xs text-blue-800 hover:underline">
                      {order.orderNo}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <Link href={`/patients/${order.patientId}`} className="font-medium text-slate-800 hover:text-blue-800">
                      {order.patient.firstName} {order.patient.lastName}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">Dr. {order.doctor.user.name}</td>
                  <td className="px-4 py-2.5 text-slate-600">{order.tests.map((t) => t.labTest.name).join(", ")}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <LabOrderActions orderId={order.id} status={order.status} />
                      {(order.status === "PROCESSING" || order.status === "RESULT_ENTERED") && (
                        <Link
                          href={`/laboratory/orders/${order.id}`}
                          className="rounded-md bg-blue-700 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-800"
                        >
                          Enter Results
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
  );
}
