"use client";

import { useActionState, useEffect, useState } from "react";
import { ArrowRight, HeartPulse, Phone, ShieldCheck, Smartphone, Wifi, Signal, BatteryFull } from "lucide-react";
import { loginAction, type LoginState } from "@/lib/actions/auth-actions";
import {
  sendRegistrationOtpAction,
  verifyRegistrationOtpAction,
  type SendOtpState,
  type VerifyOtpState,
} from "@/lib/actions/patient-registration-actions";

type Details = { phone: string; dob: string; firstName: string; lastName: string };
type Screen = "welcome" | "otp-details" | "otp-verify";

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-6 pb-1 pt-3 text-[11px] font-semibold text-white">
      <span>9:41</span>
      <div className="flex items-center gap-1">
        <Signal className="h-3 w-3" />
        <Wifi className="h-3 w-3" />
        <BatteryFull className="h-3.5 w-3.5" />
      </div>
    </div>
  );
}

function WelcomeScreen({ onRegister }: { onRegister: () => void }) {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(loginAction, undefined);

  return (
    <div className="no-scrollbar flex flex-1 flex-col justify-between overflow-y-auto bg-gradient-to-b from-blue-700 to-blue-800 px-6 py-8 text-white">
      <div className="flex flex-col items-center pt-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
          <HeartPulse className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-lg font-semibold">Sunrise Hospital</h1>
        <p className="mt-1 text-sm text-blue-100">Book visits, view records and pay bills — from your phone.</p>
      </div>

      <div className="space-y-2.5">
        <form action={formAction}>
          <input type="hidden" name="email" value="patient@demo.local" />
          <input type="hidden" name="password" value="demo1234" />
          <input type="hidden" name="callbackUrl" value="/patient-app" />
          {state?.error && <p className="mb-2 rounded-lg bg-white/10 px-3 py-2 text-xs text-white">{state.error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-blue-800 shadow-sm transition active:bg-blue-50 disabled:opacity-60"
          >
            {isPending ? "Signing in..." : "Try the demo patient"}
            {!isPending && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <button
          onClick={onRegister}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/40 px-4 py-3 text-sm font-medium text-white transition active:bg-white/10"
        >
          <Smartphone className="h-4 w-4" />
          Continue with mobile number
        </button>

        <p className="pt-1 text-center text-[10px] leading-relaxed text-blue-100/80">
          New here or returning? Enter your mobile number — we verify with a one-time code, same as a real patient app.
        </p>
      </div>
    </div>
  );
}

function OtpDetailsScreen({
  details,
  setDetails,
  onBack,
  onSent,
}: {
  details: Details;
  setDetails: (d: Details) => void;
  onBack: () => void;
  onSent: (devOtp?: string) => void;
}) {
  const [state, formAction, isPending] = useActionState<SendOtpState, FormData>(sendRegistrationOtpAction, undefined);

  useEffect(() => {
    if (state?.success) onSent(state.devOtp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="no-scrollbar flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">First name</label>
          <input
            name="firstName"
            required
            value={details.firstName}
            onChange={(e) => setDetails({ ...details, firstName: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-800"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Last name</label>
          <input
            name="lastName"
            required
            value={details.lastName}
            onChange={(e) => setDetails({ ...details, lastName: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-800"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">Mobile number</label>
        <div className="relative">
          <Phone className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            name="phone"
            required
            inputMode="numeric"
            pattern="\d{10}"
            maxLength={10}
            placeholder="10-digit mobile number"
            value={details.phone}
            onChange={(e) => setDetails({ ...details, phone: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm text-slate-800"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">Date of birth</label>
        <input
          name="dob"
          type="date"
          required
          max={new Date().toISOString().slice(0, 10)}
          value={details.dob}
          onChange={(e) => setDetails({ ...details, dob: e.target.value })}
          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-800"
        />
      </div>

      {state?.error && <p className="rounded-lg bg-red-50 px-2.5 py-2 text-xs text-red-700">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-blue-700 px-3 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {isPending ? "Sending code..." : "Send OTP"}
      </button>
      <button type="button" onClick={onBack} className="w-full text-center text-xs text-slate-500">
        Back
      </button>
    </form>
  );
}

function OtpVerifyScreen({ details, devOtp, onBack }: { details: Details; devOtp?: string; onBack: () => void }) {
  const [state, formAction, isPending] = useActionState<VerifyOtpState, FormData>(verifyRegistrationOtpAction, undefined);

  return (
    <form action={formAction} className="no-scrollbar flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
      <input type="hidden" name="phone" value={details.phone} />
      <input type="hidden" name="dob" value={details.dob} />
      <input type="hidden" name="firstName" value={details.firstName} />
      <input type="hidden" name="lastName" value={details.lastName} />

      <div className="flex items-center gap-2 text-slate-700">
        <ShieldCheck className="h-4 w-4 text-blue-700" />
        <p className="text-xs">
          Code sent to <span className="font-medium">+91 {details.phone}</span>
        </p>
      </div>

      {devOtp && (
        <p className="rounded-lg bg-amber-50 px-2.5 py-2 text-[11px] text-amber-800">
          Demo mode — no SMS gateway connected. Your code: <span className="font-mono font-semibold">{devOtp}</span>
        </p>
      )}

      <input
        name="otp"
        required
        inputMode="numeric"
        maxLength={6}
        placeholder="6-digit code"
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-center text-lg tracking-[0.3em] text-slate-800"
      />

      {state?.error && <p className="rounded-lg bg-red-50 px-2.5 py-2 text-xs text-red-700">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-blue-700 px-3 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {isPending ? "Verifying..." : "Verify & continue"}
      </button>
      <button type="button" onClick={onBack} className="w-full text-center text-xs text-slate-500">
        Change details
      </button>
    </form>
  );
}

export function PatientAuthFlow() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [details, setDetails] = useState<Details>({ phone: "", dob: "", firstName: "", lastName: "" });
  const [devOtp, setDevOtp] = useState<string | undefined>(undefined);

  useEffect(() => {
    window.history.replaceState({ screen: "welcome" }, "");

    const onPopState = (e: PopStateEvent) => {
      setScreen((e.state?.screen as Screen) ?? "welcome");
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function goTo(next: Screen) {
    window.history.pushState({ screen: next }, "");
    setScreen(next);
  }

  const title = screen === "welcome" ? "Sunrise Hospital" : screen === "otp-details" ? "Enter details" : "Verify number";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-[280px] shrink-0 overflow-hidden rounded-[2.25rem] border-[10px] border-slate-900 bg-slate-900 shadow-2xl sm:w-[300px]">
        <div className="pointer-events-none absolute left-1/2 top-0 z-10 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-slate-900" />

        <div className="flex h-[70vh] max-h-[600px] min-h-[520px] flex-col overflow-hidden rounded-[1.6rem] bg-white">
          <div className="bg-blue-700">
            <StatusBar />
          </div>

          {screen !== "welcome" && (
            <div className="bg-blue-700 px-4 pb-3 pt-0.5 text-white">
              <span className="text-[15px] font-semibold">{title}</span>
            </div>
          )}

          <div key={screen} className="app-fade-in flex flex-1 flex-col overflow-hidden">
            {screen === "welcome" && <WelcomeScreen onRegister={() => goTo("otp-details")} />}
            {screen === "otp-details" && (
              <OtpDetailsScreen
                details={details}
                setDetails={setDetails}
                onBack={() => window.history.back()}
                onSent={(otp) => {
                  setDevOtp(otp);
                  goTo("otp-verify");
                }}
              />
            )}
            {screen === "otp-verify" && (
              <OtpVerifyScreen details={details} devOtp={devOtp} onBack={() => window.history.back()} />
            )}
          </div>

          <div className="flex justify-center bg-white pb-1.5 pt-1">
            <div className="h-1 w-28 rounded-full bg-slate-300" />
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-400">This is the patient app — sign in or register right here in the app.</p>
    </div>
  );
}
