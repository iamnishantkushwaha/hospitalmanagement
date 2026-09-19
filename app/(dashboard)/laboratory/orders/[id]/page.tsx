import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { saveLabResultAction, verifyLabOrderAction } from "@/lib/actions/lab-actions";
import { VerifyButton } from "@/components/laboratory/VerifyButton";

export default async function LabOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await db.labOrder.findUnique({
    where: { id },
    include: { patient: true, doctor: { include: { user: true } }, tests: { include: { labTest: true, result: true } } },
  });

  if (!order) notFound();

  const allHaveResults = order.tests.every((t) => t.result);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <p className="font-mono text-xs text-slate-500">{order.orderNo}</p>
            <Link href={`/patients/${order.patientId}`} className="text-sm font-semibold text-slate-800 hover:text-blue-800">
              {order.patient.firstName} {order.patient.lastName}
            </Link>
            <p className="text-xs text-slate-500">Ordered by Dr. {order.doctor.user.name} on {order.orderedAt.toLocaleDateString()}</p>
          </div>
          <StatusBadge status={order.status} />
        </CardHeader>
        <CardBody className="space-y-4">
          {order.tests.map((item) => (
            <form key={item.id} action={saveLabResultAction} className="grid grid-cols-1 gap-2 rounded-md border border-slate-100 p-3 sm:grid-cols-12 sm:items-center">
              <input type="hidden" name="orderItemId" value={item.id} />
              <input type="hidden" name="orderId" value={order.id} />
              <div className="sm:col-span-3">
                <p className="text-sm font-medium text-slate-800">{item.labTest.name}</p>
                <p className="text-xs text-slate-500">{item.labTest.normalRange} {item.labTest.unit}</p>
              </div>
              <input
                name="resultValue"
                defaultValue={item.result?.resultValue ?? ""}
                placeholder="Result value"
                className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700 sm:col-span-5"
              />
              <label className="flex items-center gap-1.5 text-xs text-slate-600 sm:col-span-2">
                <input type="checkbox" name="isNormal" defaultChecked={item.result?.isNormal ?? true} className="accent-blue-700" />
                Normal
              </label>
              <button type="submit" className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-900 sm:col-span-2">
                {item.result ? "Update" : "Save"} Result
              </button>
            </form>
          ))}

          {allHaveResults && order.status !== "VERIFIED" && (
            <div className="flex justify-end border-t border-slate-100 pt-3">
              <VerifyButton orderId={order.id} action={verifyLabOrderAction} />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
