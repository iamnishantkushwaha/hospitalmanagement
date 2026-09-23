"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Phone, ShieldCheck, User as UserIcon } from "lucide-react";
import {
  sendRegistrationOtpAction,
  verifyRegistrationOtpAction,
  type SendOtpState,
  type VerifyOtpState,
} from "@/lib/actions/patient-registration-actions";

type Details = { phone: string; dob: string; firstName: string; lastName: string };

function DetailsStep({
  details,
  setDetails,
  onSent,
}: {
  details: Details;
  setDetails: (d: Details) => void;
  onSent: (devOtp?: string) => void;
}) {
  const [state, formAction, isPending] = useActionState<SendOtpState, FormData>(sendRegistrationOtpAction, undefined);

  useEffect(() => {
    if (state?.success) onSent(state.devOtp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">First name</label>
          <input
            name="firstName"
            required
            value={details.firstName}
            onChange={(e) => setDetails({ ...details, firstName: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Last name</label>
          <input
            name="lastName"
            required
            value={details.lastName}
            onChange={(e) => setDetails({ ...details, lastName: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Mobile number</label>
        <div className="relative">
          <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            name="phone"
            required
            inputMode="numeric"
            pattern="\d{10}"
            maxLength={10}
            placeholder="10-digit mobile number"
            value={details.phone}
            onChange={(e) => setDetails({ ...details, phone: e.target.value })}
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Date of birth</label>
        <input
          name="dob"
          type="date"
          required
          max={new Date().toISOString().slice(0, 10)}
          value={details.dob}
          onChange={(e) => setDetails({ ...details, dob: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
        />
      </div>

      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="group flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-700 px-3 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-60"
      >
        {isPending ? "Sending code..." : "Send OTP"}
        {!isPending && <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />}
      </button>
    </form>
  );
}

function OtpStep({ details, devOtp, onBack }: { details: Details; devOtp?: string; onBack: () => void }) {
  const [state, formAction, isPending] = useActionState<VerifyOtpState, FormData>(verifyRegistrationOtpAction, undefined);

  return (
    <form action={formAction} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
      <input type="hidden" name="phone" value={details.phone} />
      <input type="hidden" name="dob" value={details.dob} />
      <input type="hidden" name="firstName" value={details.firstName} />
      <input type="hidden" name="lastName" value={details.lastName} />

      <div className="flex items-center gap-2 text-slate-700">
        <ShieldCheck className="h-5 w-5 text-blue-700" />
        <p className="text-sm">
          Enter the code sent to <span className="font-medium">+91 {details.phone}</span>
        </p>
      </div>

      {devOtp && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Demo mode — no SMS gateway is connected yet, so here is the code: <span className="font-mono font-semibold">{devOtp}</span>
        </p>
      )}

      <input
        name="otp"
        required
        inputMode="numeric"
        maxLength={6}
        placeholder="6-digit code"
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-center text-lg tracking-[0.3em] outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
      />

      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-700 px-3 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-60"
      >
        {isPending ? "Verifying..." : "Verify & continue"}
      </button>
      <button type="button" onClick={onBack} className="w-full text-center text-xs text-slate-500 hover:text-slate-700">
        Change details
      </button>
    </form>
  );
}

export function RegisterForm() {
  const [step, setStep] = useState<"details" | "otp">("details");
  const [details, setDetails] = useState<Details>({ phone: "", dob: "", firstName: "", lastName: "" });
  const [devOtp, setDevOtp] = useState<string | undefined>(undefined);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-slate-500">
        <UserIcon className="h-4 w-4" />
        <p className="text-xs">
          New patient? We&apos;ll match you to your hospital record by phone number and date of birth, or a receptionist
          will link your account shortly after.
        </p>
      </div>

      {step === "details" ? (
        <DetailsStep
          details={details}
          setDetails={setDetails}
          onSent={(otp) => {
            setDevOtp(otp);
            setStep("otp");
          }}
        />
      ) : (
        <OtpStep details={details} devOtp={devOtp} onBack={() => setStep("details")} />
      )}

      <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Already registered?{" "}
        <Link href="/login" className="font-medium text-blue-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
