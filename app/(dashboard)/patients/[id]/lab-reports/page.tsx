import { FlaskConical } from "lucide-react";
import { db } from "@/lib/db";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default async function PatientLabReportsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const labOrders = await db.labOrder.findMany({
    where: { patientId: id },
    include: { doctor: { include: { user: true } }, tests: { include: { labTest: true, result: true } } },
    orderBy: { orderedAt: "desc" },
  });

  if (labOrders.length === 0) {
    return (
      <Card>
        <EmptyState icon={FlaskConical} title="No lab reports yet" description="Lab orders and results will appear here." />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {labOrders.map((order) => (
        <Card key={order.id}>
          <CardHeader className="flex items-center justify-between">
            <div>
              <p className="font-mono text-xs text-slate-500">{order.orderNo}</p>
              <p className="text-sm font-medium text-slate-800">Ordered by Dr. {order.doctor.user.name}</p>
            </div>
            <StatusBadge status={order.status} />
          </CardHeader>
          <CardBody>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                  <th className="pb-2">Test</th>
                  <th className="pb-2">Result</th>
                  <th className="pb-2">Normal Range</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.tests.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 text-slate-800">{item.labTest.name}</td>
                    <td className="py-2 text-slate-600">
                      {item.result ? (
                        <span className={item.result.isNormal ? "text-emerald-700" : "text-rose-700"}>
                          {item.result.resultValue}
                        </span>
                      ) : (
                        <span className="text-slate-400">Pending</span>
                      )}
                    </td>
                    <td className="py-2 text-slate-500">{item.labTest.normalRange} {item.labTest.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
