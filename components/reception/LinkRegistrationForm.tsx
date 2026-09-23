"use client";

import { useActionState } from "react";
import { linkPendingRegistrationAction, type LinkRegistrationState } from "@/lib/actions/patient-registration-actions";

export function LinkRegistrationForm({ pendingId }: { pendingId: string }) {
  const [state, formAction, isPending] = useActionState<LinkRegistrationState, FormData>(
    linkPendingRegistrationAction,
    undefined
  );

  return (
    <form action={formAction} className="mt-2 flex flex-wrap items-center gap-2">
      <input type="hidden" name="pendingId" value={pendingId} />
      <input
        name="mrn"
        placeholder="Existing patient MRN (e.g. PAT-000012)"
        className="w-56 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
      >
        {isPending ? "Linking..." : "Link to this MRN"}
      </button>
      {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
      {state?.success && <span className="text-xs text-emerald-600">{state.success}</span>}
    </form>
  );
}
