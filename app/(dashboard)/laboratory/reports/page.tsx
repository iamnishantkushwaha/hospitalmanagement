import Link from "next/link";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FileCheck2 } from "lucide-react";

export default async function LabReportsPage() {
  const orders = await db.labOrder.findMany({
    where: { status: "VERIFIED" },
    include: { patient: true, doctor: { include: { user: true } }, tests: { include: { labTest: true } } },
    orderBy: { orderedAt: "desc" },
    take: 100,
  });

  return (
    <Card>
      {orders.length === 0 ? (
        <EmptyState icon={FileCheck2} title="No verified reports yet" description="Verified lab reports will appear here." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-4 py-2.5">Order No.</th>
                <th className="px-4 py-2.5">Patient</th>
                <th className="px-4 py-2.5">Doctor</th>
                <th className="px-4 py-2.5">Tests</th>
                <th className="px-4 py-2.5">Ordered</th>
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
                  <td className="px-4 py-2.5 text-slate-500">{order.orderedAt.toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
