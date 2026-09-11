import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";

export default async function LabTestCatalogPage() {
  const tests = await db.labTest.findMany({ orderBy: { name: "asc" } });

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-2.5">Test Name</th>
              <th className="px-4 py-2.5">Category</th>
              <th className="px-4 py-2.5">Normal Range</th>
              <th className="px-4 py-2.5">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tests.map((test) => (
              <tr key={test.id} className="hover:bg-slate-50">
                <td className="px-4 py-2.5 font-medium text-slate-800">{test.name}</td>
                <td className="px-4 py-2.5 text-slate-600">{test.category ?? "—"}</td>
                <td className="px-4 py-2.5 text-slate-600">{test.normalRange} {test.unit}</td>
                <td className="px-4 py-2.5 text-slate-700">₹{Number(test.price).toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
