import Image from "next/image";
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
      <div className="relative hidden w-[45%] shrink-0 overflow-hidden bg-slate-900 lg:flex lg:flex-col lg:justify-between lg:p-10">
        <div className="relative">
          <div className="flex flex-col items-start gap-3">
            <Image
              src="/adrs-logo-light.png"
              alt="ADRS Techno – Innovative & Tech"
              width={470}
              height={220}
              priority
              className="h-auto w-52"
            />
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{HOSPITAL_NAME}</span>
          </div>

          <h1 className="mt-16 max-w-md text-3xl font-semibold leading-tight text-white">
            One connected view of every patient journey.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-300">
            From registration and OPD to lab results, admissions and billing —
            everything a hospital team needs, in a single operations platform.
          </p>
        </div>

        <div className="relative grid grid-cols-2 gap-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.label}
              className="flex items-center gap-2.5 rounded-xl bg-slate-800/70 px-3.5 py-3 text-sm text-slate-100 ring-1 ring-slate-700"
            >
              <feature.icon className="h-4 w-4 shrink-0 text-blue-300" />
              <span className="truncate">{feature.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center overflow-hidden bg-slate-50 px-4 py-6 lg:bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-5 text-center lg:hidden">
            <Image
              src="/adrs-logo-dark.png"
              alt="ADRS Techno – Innovative & Tech"
              width={470}
              height={220}
              priority
              className="mx-auto mb-3 h-auto w-40"
            />
            <h1 className="text-lg font-semibold text-slate-900">{HOSPITAL_NAME}</h1>
            <p className="text-sm text-slate-500">Hospital &amp; Patient Management System</p>
          </div>
          <div className="mb-5 hidden rounded-xl border border-slate-200 bg-slate-50 p-5 text-center lg:block">
            <div className="relative mx-auto mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-700/10 text-blue-800 ring-1 ring-blue-700/20">
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
