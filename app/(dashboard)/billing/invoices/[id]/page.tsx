import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { HOSPITAL_NAME } from "@/lib/constants";
import { PaymentForm } from "@/components/billing/PaymentForm";
import { PrintButton } from "@/components/billing/PrintButton";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const invoice = await db.invoice.findUnique({
    where: { id },
    include: { patient: true, items: true, payments: true },
  });

  if (!invoice) notFound();

  const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const balanceDue = Number(invoice.totalAmt) - totalPaid;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card>
        <CardHeader className="flex items-center justify-between print:hidden">
          <Link href="/billing/invoices" className="text-sm text-slate-500 hover:text-blue-800">
            ← Back to Invoices
          </Link>
          <PrintButton />
        </CardHeader>
        <CardBody className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-lg font-semibold text-slate-900">{HOSPITAL_NAME}</p>
              <p className="text-sm text-slate-500">Invoice {invoice.invoiceNo}</p>
              <p className="text-xs text-slate-400">{invoice.createdAt.toLocaleDateString()}</p>
            </div>
            <StatusBadge status={invoice.status} />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Billed To</p>
            <p className="font-medium text-slate-800">{invoice.patient.firstName} {invoice.patient.lastName}</p>
            <p className="text-sm text-slate-500">{invoice.patient.mrn} · {invoice.patient.phone ?? "—"}</p>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-2">Description</th>
                <th className="pb-2 text-right">Qty</th>
                <th className="pb-2 text-right">Unit Price</th>
                <th className="pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-2 text-slate-700">{item.description}</td>
                  <td className="py-2 text-right text-slate-600">{item.quantity}</td>
                  <td className="py-2 text-right text-slate-600">₹{Number(item.unitPrice).toLocaleString("en-IN")}</td>
                  <td className="py-2 text-right text-slate-700">₹{Number(item.amount).toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="ml-auto max-w-xs space-y-1 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>₹{Number(invoice.subtotalAmt).toLocaleString("en-IN")}</span>
            </div>
            {Number(invoice.discountAmt) > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Discount</span>
                <span>-₹{Number(invoice.discountAmt).toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-200 pt-1 font-semibold text-slate-900">
              <span>Total</span>
              <span>₹{Number(invoice.totalAmt).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-emerald-700">
              <span>Paid</span>
              <span>₹{totalPaid.toLocaleString("en-IN")}</span>
            </div>
            {balanceDue > 0 && (
              <div className="flex justify-between font-medium text-rose-700">
                <span>Balance Due</span>
                <span>₹{balanceDue.toLocaleString("en-IN")}</span>
              </div>
            )}
          </div>

          {invoice.payments.length > 0 && (
            <div className="border-t border-slate-100 pt-3 text-xs text-slate-500">
              <p className="mb-1 font-medium text-slate-600">Payment History</p>
              {invoice.payments.map((p) => (
                <p key={p.id}>
                  ₹{Number(p.amount).toLocaleString("en-IN")} via {p.method} on {p.paidAt.toLocaleDateString()}
                </p>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {balanceDue > 0 && (
        <div className="print:hidden">
          <PaymentForm invoiceId={invoice.id} balanceDue={balanceDue} />
        </div>
      )}
    </div>
  );
}
