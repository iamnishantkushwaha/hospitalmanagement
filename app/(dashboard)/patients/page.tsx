import Link from "next/link";
import { Plus, Search, Users } from "lucide-react";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

function calculateAge(dob: Date | null): string {
  if (!dob) return "—";
  const diff = Date.now() - dob.getTime();
  const age = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  return `${age} yrs`;
}

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const patients = await db.patient.findMany({
    where: q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { mrn: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        description={`${patients.length} patient${patients.length === 1 ? "" : "s"} ${q ? "matching your search" : "registered"}`}
        action={
          <Link
            href="/patients/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" />
            New Patient
          </Link>
        }
      />

      <Card>
        <div className="border-b border-slate-100 p-3">
          <form className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search by name, MRN or phone..."
              className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 sm:w-80"
            />
          </form>
        </div>

        {patients.length === 0 ? (
          <EmptyState
            icon={Users}
            title={q ? "No patients found" : "No patients registered yet"}
            description={q ? "Try a different search term." : "Register your first patient to get started."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2.5">MRN</th>
                  <th className="px-4 py-2.5">Name</th>
                  <th className="px-4 py-2.5">Age / Gender</th>
                  <th className="px-4 py-2.5">Phone</th>
                  <th className="px-4 py-2.5">Blood Group</th>
                  <th className="px-4 py-2.5">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5">
                      <Link href={`/patients/${patient.id}`} className="font-mono text-xs text-teal-700 hover:underline">
                        {patient.mrn}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <Link href={`/patients/${patient.id}`} className="font-medium text-slate-800 hover:text-teal-700">
                        {patient.firstName} {patient.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">
                      {calculateAge(patient.dateOfBirth)}
                      {patient.gender ? ` · ${patient.gender.charAt(0)}${patient.gender.slice(1).toLowerCase()}` : ""}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{patient.phone ?? "—"}</td>
                    <td className="px-4 py-2.5 text-slate-600">{patient.bloodGroup ?? "—"}</td>
                    <td className="px-4 py-2.5 text-slate-500">{new Date(patient.createdAt).toLocaleDateString()}</td>
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
