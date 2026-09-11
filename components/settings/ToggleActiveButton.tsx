"use client";

import { useTransition } from "react";
import { toggleUserActiveAction } from "@/lib/actions/settings-actions";

export function ToggleActiveButton({ userId, isActive }: { userId: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => toggleUserActiveAction(userId))}
      className={`rounded-md px-2.5 py-1 text-xs font-medium disabled:opacity-50 ${
        isActive ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
      }`}
    >
      {isActive ? "Deactivate" : "Activate"}
    </button>
  );
}
