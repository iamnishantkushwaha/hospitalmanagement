import { AlertTriangle } from "lucide-react";
import type { Patient } from "@prisma/client";

function calculateAge(dob: Date | null): number | null {
  if (!dob) return null;
  const diff = Date.now() - dob.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

export function PatientHeader({ patient }: { patient: Patient }) {
  const age = calculateAge(patient.dateOfBirth);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-700 text-lg font-semibold text-white">
            {patient.firstName.charAt(0)}
            {patient.lastName.charAt(0)}
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="font-mono text-xs text-slate-500">{patient.mrn}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-slate-600 sm:gap-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Age / Gender</p>
            <p className="font-medium text-slate-800">
              {age !== null ? `${age} yrs` : "—"}
              {patient.gender ? ` · ${patient.gender.charAt(0)}${patient.gender.slice(1).toLowerCase()}` : ""}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Blood Group</p>
            <p className="font-medium text-slate-800">{patient.bloodGroup ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Phone</p>
            <p className="font-medium text-slate-800">{patient.phone ?? "—"}</p>
          </div>
        </div>
      </div>

      {patient.allergies && (
        <div className="mt-3 flex items-center gap-2 rounded-md bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Allergies: {patient.allergies}
        </div>
      )}
    </div>
  );
}
