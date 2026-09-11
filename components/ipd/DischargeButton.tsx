"use client";

import { useTransition } from "react";
import { dischargeAdmissionAction } from "@/lib/actions/admission-actions";

export function DischargeButton({ admissionId }: { admissionId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => dischargeAdmissionAction(admissionId))}
      className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
    >
      {isPending ? "Discharging..." : "Discharge"}
    </button>
  );
}
