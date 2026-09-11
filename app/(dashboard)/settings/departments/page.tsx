import { db } from "@/lib/db";
import { Card, CardBody } from "@/components/ui/Card";
import { NewDepartmentForm } from "@/components/settings/NewDepartmentForm";

export default async function DepartmentsSettingsPage() {
  const [departments, hospital] = await Promise.all([
    db.department.findMany({ include: { _count: { select: { doctors: true } } }, orderBy: { name: "asc" } }),
    db.hospital.findFirst(),
  ]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2.5">Department</th>
                  <th className="px-4 py-2.5">Doctors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-medium text-slate-800">{dept.name}</td>
                    <td className="px-4 py-2.5 text-slate-600">{dept._count.doctors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {hospital && (
        <Card>
          <CardBody>
            <NewDepartmentForm hospitalId={hospital.id} />
          </CardBody>
        </Card>
      )}
    </div>
  );
}
