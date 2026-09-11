import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";

const LOW_STOCK_THRESHOLD = 10;

export default async function MedicinesPage() {
  const medicines = await db.medicine.findMany({
    include: { batches: true },
    orderBy: { name: "asc" },
  });

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-2.5">Medicine</th>
              <th className="px-4 py-2.5">Category</th>
              <th className="px-4 py-2.5">Unit Price</th>
              <th className="px-4 py-2.5">Stock</th>
              <th className="px-4 py-2.5">Nearest Expiry</th>
              <th className="px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {medicines.map((medicine) => {
              const totalStock = medicine.batches.reduce((sum, b) => sum + b.quantity, 0);
              const nearestExpiry = medicine.batches
                .filter((b) => b.quantity > 0)
                .sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime())[0];
              const lowStock = totalStock < LOW_STOCK_THRESHOLD;

              return (
                <tr key={medicine.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-medium text-slate-800">{medicine.name}</td>
                  <td className="px-4 py-2.5 text-slate-600">{medicine.category ?? "—"}</td>
                  <td className="px-4 py-2.5 text-slate-700">₹{Number(medicine.price).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-2.5 text-slate-700">{totalStock} {medicine.unit}(s)</td>
                  <td className="px-4 py-2.5 text-slate-500">{nearestExpiry ? nearestExpiry.expiryDate.toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        lowStock ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {lowStock ? "Low Stock" : "In Stock"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
