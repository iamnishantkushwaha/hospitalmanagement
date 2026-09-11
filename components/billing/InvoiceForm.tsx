"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createInvoiceAction } from "@/lib/actions/billing-actions";
import { Card, CardBody } from "@/components/ui/Card";

const inputClass =
  "w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600";

type PatientOption = { id: string; firstName: string; lastName: string; mrn: string };
type LineItem = { description: string; quantity: number; unitPrice: number };

export function InvoiceForm({ patients }: { patients: PatientOption[] }) {
  const [state, formAction, isPending] = useActionState(createInvoiceAction, undefined);
  const [items, setItems] = useState<LineItem[]>([{ description: "", quantity: 1, unitPrice: 0 }]);
  const [discount, setDiscount] = useState(0);

  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const total = Math.max(0, subtotal - discount);

  function updateItem(index: number, patch: Partial<LineItem>) {
    setItems((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="items" value={JSON.stringify(items.filter((i) => i.description))} />

      <Card>
        <CardBody className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Patient</label>
            <select name="patientId" required className={inputClass} defaultValue="">
              <option value="" disabled>Select patient</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.mrn})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Line Items</label>
              <button
                type="button"
                onClick={() => setItems((rows) => [...rows, { description: "", quantity: 1, unitPrice: 0 }])}
                className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Item
              </button>
            </div>
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 items-center gap-2">
                <input
                  className={`${inputClass} col-span-6`}
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem(i, { description: e.target.value })}
                />
                <input
                  type="number"
                  min={1}
                  className={`${inputClass} col-span-2`}
                  value={item.quantity}
                  onChange={(e) => updateItem(i, { quantity: Number(e.target.value) })}
                />
                <input
                  type="number"
                  min={0}
                  className={`${inputClass} col-span-3`}
                  placeholder="Unit price"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(i, { unitPrice: Number(e.target.value) })}
                />
                <button
                  type="button"
                  onClick={() => setItems((rows) => rows.filter((_, idx) => idx !== i))}
                  className="col-span-1 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700">Discount (₹)</label>
            <input
              name="discountAmt"
              type="number"
              min={0}
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className={`${inputClass} w-32`}
            />
          </div>

          <div className="flex justify-between border-t border-slate-100 pt-3 text-sm">
            <span className="text-slate-500">Subtotal: ₹{subtotal.toLocaleString("en-IN")}</span>
            <span className="font-semibold text-slate-900">Total: ₹{total.toLocaleString("en-IN")}</span>
          </div>

          {state?.error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {isPending ? "Creating..." : "Create Invoice"}
            </button>
          </div>
        </CardBody>
      </Card>
    </form>
  );
}
