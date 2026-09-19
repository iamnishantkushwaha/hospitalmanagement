import Link from "next/link";
import { Plus, Receipt } from "lucide-react";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default async function InvoicesPage() {
  const invoices = await db.invoice.findMany({
    include: { patient: true },
    orderBy: { createdAt: "desc" },
    take: 150,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link
          href="/billing/invoices/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          <Plus className="h-4 w-4" />
          New Invoice
        </Link>
      </div>

      <Card>
        {invoices.length === 0 ? (
          <EmptyState icon={Receipt} title="No invoices yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2.5">Invoice No.</th>
                  <th className="px-4 py-2.5">Patient</th>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Amount</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5">
                      <Link href={`/billing/invoices/${invoice.id}`} className="font-mono text-xs text-blue-800 hover:underline">
                        {invoice.invoiceNo}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <Link href={`/patients/${invoice.patientId}`} className="font-medium text-slate-800 hover:text-blue-800">
                        {invoice.patient.firstName} {invoice.patient.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">{invoice.createdAt.toLocaleDateString()}</td>
                    <td className="px-4 py-2.5 text-slate-700">₹{Number(invoice.totalAmt).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={invoice.status} />
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
