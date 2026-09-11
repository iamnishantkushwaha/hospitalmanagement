"use client";

import { useActionState } from "react";
import { createDepartmentAction } from "@/lib/actions/settings-actions";

const inputClass =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600";

export function NewDepartmentForm({ hospitalId }: { hospitalId: string }) {
  const [state, formAction, isPending] = useActionState(createDepartmentAction, undefined);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="hospitalId" value={hospitalId} />
      <h2 className="text-sm font-semibold text-slate-800">Add Department</h2>
      <input name="name" placeholder="Department name" required className={inputClass} />
      <textarea name="description" placeholder="Description (optional)" rows={2} className={inputClass} />
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state?.success && <p className="text-xs text-emerald-600">Department added.</p>}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
      >
        {isPending ? "Adding..." : "Add Department"}
      </button>
    </form>
  );
}
