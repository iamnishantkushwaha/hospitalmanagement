"use client";

import { useTransition } from "react";
import { recordPaymentAction } from "@/lib/actions/billing-actions";
import { Card, CardBody } from "@/components/ui/Card";

const inputClass =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600";

export function PaymentForm({ invoiceId, balanceDue }: { invoiceId: string; balanceDue: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Card>
      <CardBody>
        <h2 className="mb-3 text-sm font-semibold text-slate-800">Record Payment</h2>
        <form
          action={(formData) => startTransition(() => recordPaymentAction(formData))}
          className="grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          <input type="hidden" name="invoiceId" value={invoiceId} />
          <div>
            <label className="text-xs font-medium text-slate-600">Amount (₹)</label>
            <input name="amount" type="number" step="0.01" min={0} max={balanceDue} defaultValue={balanceDue} required className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Method</label>
            <select name="method" className={inputClass} defaultValue="CASH">
              {["CASH", "CARD", "UPI", "INSURANCE", "OTHER"].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {isPending ? "Recording..." : "Record Payment"}
            </button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
