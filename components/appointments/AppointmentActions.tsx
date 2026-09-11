"use client";

import { useTransition } from "react";
import { updateAppointmentStatusAction } from "@/lib/actions/appointment-actions";
import type { AppointmentStatus } from "@prisma/client";

const NEXT_ACTIONS: Partial<Record<AppointmentStatus, { label: string; next: AppointmentStatus; className: string }[]>> = {
  SCHEDULED: [
    { label: "Check In", next: "CHECKED_IN", className: "bg-amber-50 text-amber-700 hover:bg-amber-100" },
    { label: "Cancel", next: "CANCELLED", className: "bg-slate-100 text-slate-600 hover:bg-slate-200" },
    { label: "No-show", next: "NO_SHOW", className: "bg-rose-50 text-rose-700 hover:bg-rose-100" },
  ],
  CHECKED_IN: [
    { label: "Start Consultation", next: "IN_CONSULTATION", className: "bg-violet-50 text-violet-700 hover:bg-violet-100" },
  ],
  IN_CONSULTATION: [
    { label: "Complete", next: "COMPLETED", className: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
  ],
};

export function AppointmentActions({ appointmentId, status }: { appointmentId: string; status: AppointmentStatus }) {
  const [isPending, startTransition] = useTransition();
  const actions = NEXT_ACTIONS[status];

  if (!actions) return <span className="text-xs text-slate-400">—</span>;

  return (
    <div className="flex flex-wrap gap-1.5">
      {actions.map((action) => (
        <button
          key={action.next}
          disabled={isPending}
          onClick={() => startTransition(() => updateAppointmentStatusAction(appointmentId, action.next))}
          className={`rounded-md px-2 py-1 text-xs font-medium transition disabled:opacity-50 ${action.className}`}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
