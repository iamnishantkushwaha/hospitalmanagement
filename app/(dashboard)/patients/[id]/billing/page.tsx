import { Receipt } from "lucide-react";
import { db } from "@/lib/db";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default async function PatientBillingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const invoices = await db.invoice.findMany({
    where: { patientId: id },
    include: { items: true, payments: true },
    orderBy: { createdAt: "desc" },
  });

  if (invoices.length === 0) {
    return (
      <Card>
        <EmptyState icon={Receipt} title="No invoices yet" description="Bills raised for this patient will appear here." />
      </Card>
    );
  }

  const totalBilled = invoices.reduce((sum, inv) => sum + Number(inv.totalAmt), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.payments.reduce((s, p) => s + Number(p.amount), 0), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <SummaryCard label="Total Billed" value={totalBilled} />
        <SummaryCard label="Total Paid" value={totalPaid} accent="text-emerald-700" />
        <SummaryCard label="Outstanding" value={totalBilled - totalPaid} accent="text-rose-700" />
      </div>

      {invoices.map((invoice) => (
        <Card key={invoice.id}>
          <CardHeader className="flex items-center justify-between">
            <div>
              <p className="font-mono text-xs text-slate-500">{invoice.invoiceNo}</p>
              <p className="text-xs text-slate-400">{invoice.createdAt.toLocaleDateString()}</p>
            </div>
            <StatusBadge status={invoice.status} />
          </CardHeader>
          <CardBody>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-1.5 text-slate-700">{item.description}</td>
                    <td className="py-1.5 text-right text-slate-600">
                      ₹{Number(item.amount).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
                {Number(invoice.discountAmt) > 0 && (
                  <tr>
                    <td className="py-1.5 text-slate-500">Discount</td>
                    <td className="py-1.5 text-right text-slate-500">
                      -₹{Number(invoice.discountAmt).toLocaleString("en-IN")}
                    </td>
                  </tr>
                )}
                <tr className="font-semibold text-slate-900">
                  <td className="pt-2">Total</td>
                  <td className="pt-2 text-right">₹{Number(invoice.totalAmt).toLocaleString("en-IN")}</td>
                </tr>
              </tbody>
            </table>
            {invoice.payments.length > 0 && (
              <div className="mt-3 border-t border-slate-100 pt-2 text-xs text-slate-500">
                Paid ₹{invoice.payments.reduce((s, p) => s + Number(p.amount), 0).toLocaleString("en-IN")} via{" "}
                {invoice.payments.map((p) => p.method).join(", ")}
              </div>
            )}
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${accent ?? "text-slate-900"}`}>
        ₹{value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}
