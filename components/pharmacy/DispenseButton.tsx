"use client";

import { useTransition } from "react";
import { dispensePrescriptionItemAction } from "@/lib/actions/pharmacy-actions";

export function DispenseButton({ prescriptionItemId }: { prescriptionItemId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => dispensePrescriptionItemAction(prescriptionItemId))}
      className="rounded-md bg-teal-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-teal-700 disabled:opacity-50"
    >
      {isPending ? "Dispensing..." : "Dispense"}
    </button>
  );
}
