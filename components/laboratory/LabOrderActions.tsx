"use client";

import { useTransition } from "react";
import { updateLabOrderStatusAction } from "@/lib/actions/lab-actions";
import type { LabOrderStatus } from "@prisma/client";

const NEXT: Partial<Record<LabOrderStatus, { label: string; next: LabOrderStatus }>> = {
  ORDERED: { label: "Mark Sample Collected", next: "SAMPLE_COLLECTED" },
  SAMPLE_COLLECTED: { label: "Start Processing", next: "PROCESSING" },
};

export function LabOrderActions({ orderId, status }: { orderId: string; status: LabOrderStatus }) {
  const [isPending, startTransition] = useTransition();
  const action = NEXT[status];
  if (!action) return null;

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => updateLabOrderStatusAction(orderId, action.next))}
      className="rounded-md bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 hover:bg-sky-100 disabled:opacity-50"
    >
      {action.label}
    </button>
  );
}
