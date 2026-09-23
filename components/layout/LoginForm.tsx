"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  FlaskConical,
  HeartPulse,
  Lock,
  Mail,
  Pill,
  Receipt,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  UserCog,
} from "lucide-react";
import { loginAction } from "@/lib/actions/auth-actions";
import { cn } from "@/lib/utils";

const DEMO_PASSWORD = "demo1234";

const DEMO_ACCOUNTS = [
  { role: "Admin", email: "admin@demo.local", icon: ShieldCheck },
  { role: "Receptionist", email: "reception@demo.local", icon: UserCog },
  { role: "Doctor", email: "doctor@demo.local", icon: Stethoscope },
  { role: "Nurse", email: "nurse@demo.local", icon: HeartPulse },
  { role: "Lab Technician", email: "lab@demo.local", icon: FlaskConical },
  { role: "Pharmacist", email: "pharmacy@demo.local", icon: Pill },
  { role: "Billing Staff", email: "billing@demo.local", icon: Receipt },
];

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<string | null>(null);

  function fillAccount(email: string) {
    if (emailRef.current) emailRef.current.value = email;
    if (passwordRef.current) passwordRef.current.value = DEMO_PASSWORD;
    setSelected(email);
  }

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              ref={emailRef}
              id="email"
              name="email"
              type="email"
              required
              autoComplete="off"
              placeholder="e.g. admin@demo.local"
              onChange={() => setSelected(null)}
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              ref={passwordRef}
              id="password"
              name="password"
              type="password"
              required
              autoComplete="off"
              placeholder="demo1234"
              onChange={() => setSelected(null)}
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
            />
          </div>
        </div>

        {state?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="group flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-700 px-3 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-60"
        >
          {isPending ? "Signing in..." : "Sign in"}
          {!isPending && <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />}
        </button>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60">
        <p className="text-sm font-medium text-slate-700">Demo accounts</p>
        <p className="mb-2.5 text-xs text-slate-400">Password for every account: <span className="font-mono text-slate-500">demo1234</span></p>
        <div className="max-h-44 grid grid-cols-1 gap-1.5 overflow-y-auto pr-0.5 sm:grid-cols-2">
          {DEMO_ACCOUNTS.map((account) => {
            const Icon = account.icon;
            const active = selected === account.email;
            return (
              <button
                key={account.email}
                type="button"
                onClick={() => fillAccount(account.email)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs transition",
                  active
                    ? "border-blue-700 bg-blue-50 text-blue-800"
                    : "border-slate-200 text-slate-600 hover:border-blue-200 hover:bg-blue-50/50"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5 shrink-0", active ? "text-blue-700" : "text-slate-400")} />
                <span className="truncate font-medium">{account.role}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Link
        href="/patient-app"
        className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 shadow-sm shadow-slate-200/60 transition hover:border-blue-200 hover:bg-blue-50"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white">
          <Smartphone className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-800">Patient App</p>
          <p className="text-xs text-slate-500">Sign in or register right inside the app.</p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-blue-700" />
      </Link>
    </div>
  );
}
