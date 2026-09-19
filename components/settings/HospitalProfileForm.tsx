"use client";

import { useActionState } from "react";
import { updateHospitalProfileAction } from "@/lib/actions/settings-actions";
import { Card, CardBody } from "@/components/ui/Card";
import type { Hospital } from "@prisma/client";

const inputClass =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700";

export function HospitalProfileForm({ hospital }: { hospital: Hospital }) {
  const [state, formAction, isPending] = useActionState(updateHospitalProfileAction, undefined);

  return (
    <form action={formAction} className="max-w-xl">
      <Card>
        <CardBody className="space-y-4">
          <input type="hidden" name="id" value={hospital.id} />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Hospital Name</label>
            <input name="name" defaultValue={hospital.name} required className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Address</label>
            <textarea name="address" defaultValue={hospital.address ?? ""} rows={2} className={inputClass} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Phone</label>
              <input name="phone" defaultValue={hospital.phone ?? ""} className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input name="email" type="email" defaultValue={hospital.email ?? ""} className={inputClass} />
            </div>
          </div>

          {state?.error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
          {state?.success && <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Saved successfully.</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </CardBody>
      </Card>
    </form>
  );
}
