import Link from "next/link";
import { CreditCard } from "lucide-react";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function PaymentsPage() {
  const payments = await db.payment.findMany({
    include: { invoice: { include: { patient: true } } },
    orderBy: { paidAt: "desc" },
    take: 150,
  });

  return (
    <Card>
      {payments.length === 0 ? (
        <EmptyState icon={CreditCard} title="No payments recorded yet" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Invoice</th>
                <th className="px-4 py-2.5">Patient</th>
                <th className="px-4 py-2.5">Method</th>
                <th className="px-4 py-2.5">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 text-slate-500">{payment.paidAt.toLocaleDateString()}</td>
                  <td className="px-4 py-2.5">
                    <Link href={`/billing/invoices/${payment.invoiceId}`} className="font-mono text-xs text-blue-800 hover:underline">
                      {payment.invoice.invoiceNo}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-slate-700">
                    {payment.invoice.patient.firstName} {payment.invoice.patient.lastName}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">{payment.method}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-800">₹{Number(payment.amount).toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
