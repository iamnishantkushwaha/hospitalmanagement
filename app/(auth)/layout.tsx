import { Activity, BedDouble, FlaskConical, LogIn, Receipt, Stethoscope, Users } from "lucide-react";
import { HOSPITAL_NAME } from "@/lib/constants";

const FEATURES = [
  { icon: Users, label: "Patient Records" },
  { icon: Stethoscope, label: "OPD Consultations" },
  { icon: BedDouble, label: "IPD & Bed Management" },
  { icon: FlaskConical, label: "Laboratory" },
  { icon: Receipt, label: "Billing & Invoices" },
  { icon: Activity, label: "Live Dashboards" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <div className="relative hidden w-[45%] shrink-0 overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-slate-900 lg:flex lg:flex-col lg:justify-between lg:p-10">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] bg-[size:24px_24px]" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-lg font-bold text-white ring-1 ring-white/20 backdrop-blur">
              H
            </div>
            <span className="text-lg font-semibold text-white">{HOSPITAL_NAME}</span>
          </div>

          <h1 className="mt-16 max-w-md text-3xl font-semibold leading-tight text-white">
            One connected view of every patient journey.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-teal-50/80">
            From registration and OPD to lab results, admissions and billing —
            everything a hospital team needs, in a single operations platform.
          </p>
        </div>

        <div className="relative grid grid-cols-2 gap-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.label}
              className="flex items-center gap-2.5 rounded-xl bg-white/10 px-3.5 py-3 text-sm text-white ring-1 ring-white/15 backdrop-blur"
            >
              <feature.icon className="h-4 w-4 shrink-0 text-teal-200" />
              <span className="truncate">{feature.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center overflow-hidden bg-slate-50 px-4 py-6 lg:bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-5 text-center lg:hidden">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-xl font-bold text-white">
              H
            </div>
            <h1 className="text-lg font-semibold text-slate-900">{HOSPITAL_NAME}</h1>
            <p className="text-sm text-slate-500">Hospital &amp; Patient Management System</p>
          </div>
          <div className="relative mb-5 hidden overflow-hidden rounded-2xl border border-teal-900/10 bg-gradient-to-br from-teal-50/70 via-white/40 to-slate-50/70 p-5 text-center shadow-sm shadow-slate-200/50 backdrop-blur-md lg:block">
            <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-teal-200/30 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-8 h-24 w-24 rounded-full bg-slate-300/20 blur-2xl" />
            <div className="relative mx-auto mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600/10 text-teal-700 ring-1 ring-teal-600/20">
              <LogIn className="h-[18px] w-[18px]" />
            </div>
            <h2 className="relative text-lg font-semibold text-slate-900">Welcome back</h2>
            <p className="relative mt-1 text-sm text-slate-500">Sign in to access your dashboard.</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
