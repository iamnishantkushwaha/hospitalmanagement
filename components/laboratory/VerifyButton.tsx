"use client";

import { useTransition } from "react";
import { CheckCircle2 } from "lucide-react";

export function VerifyButton({ orderId, action }: { orderId: string; action: (orderId: string) => Promise<void> }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => action(orderId))}
      className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
    >
      <CheckCircle2 className="h-4 w-4" />
      {isPending ? "Verifying..." : "Verify Report"}
    </button>
  );
}
