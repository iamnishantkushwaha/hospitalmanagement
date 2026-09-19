"use client";

import { useActionState } from "react";
import { createAdmissionAction } from "@/lib/actions/admission-actions";
import { Card, CardBody } from "@/components/ui/Card";
import type { Bed, Doctor, Room, User, Ward } from "@prisma/client";

const inputClass =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700";

type PatientOption = { id: string; firstName: string; lastName: string; mrn: string };
type DoctorOption = Doctor & { user: User };
type BedOption = Bed & { room: Room & { ward: Ward } };

export function AdmissionForm({ patients, doctors, beds }: { patients: PatientOption[]; doctors: DoctorOption[]; beds: BedOption[] }) {
  const [state, formAction, isPending] = useActionState(createAdmissionAction, undefined);
  const errors = state?.fieldErrors ?? {};

  return (
    <form action={formAction}>
      <Card>
        <CardBody className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="patientId">Patient</label>
            <select id="patientId" name="patientId" required className={inputClass} defaultValue="">
              <option value="" disabled>Select patient</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.mrn})</option>
              ))}
            </select>
            {errors.patientId && <p className="text-xs text-red-600">{errors.patientId}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="doctorId">Attending Doctor</label>
            <select id="doctorId" name="doctorId" required className={inputClass} defaultValue="">
              <option value="" disabled>Select doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>Dr. {d.user.name}</option>
              ))}
            </select>
            {errors.doctorId && <p className="text-xs text-red-600">{errors.doctorId}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="bedId">Available Bed</label>
            <select id="bedId" name="bedId" required className={inputClass} defaultValue="">
              <option value="" disabled>Select bed</option>
              {beds.map((bed) => (
                <option key={bed.id} value={bed.id}>
                  {bed.room.ward.name} · {bed.bedNo}
                </option>
              ))}
            </select>
            {beds.length === 0 && <p className="text-xs text-amber-600">No beds available right now.</p>}
            {errors.bedId && <p className="text-xs text-red-600">{errors.bedId}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="dailyChargeAmt">Daily Room Charge (₹)</label>
            <input id="dailyChargeAmt" name="dailyChargeAmt" type="number" min={0} defaultValue={1500} required className={inputClass} />
            {errors.dailyChargeAmt && <p className="text-xs text-red-600">{errors.dailyChargeAmt}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="reason">Reason for Admission</label>
            <textarea id="reason" name="reason" rows={2} className={inputClass} />
          </div>

          {state?.error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending || beds.length === 0}
              className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {isPending ? "Admitting..." : "Admit Patient"}
            </button>
          </div>
        </CardBody>
      </Card>
    </form>
  );
}
