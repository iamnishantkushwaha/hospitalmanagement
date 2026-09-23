"use client";

import type { ReactNode } from "react";
import { BatteryFull, Signal, Wifi } from "lucide-react";

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

/**
 * Shared phone-frame chrome (bezel, notch, status bar, home indicator) used
 * everywhere the patient app is rendered as an in-web mobile mockup, so every
 * screen — signed-out welcome/OTP, signed-in portal, and any in-between state
 * like "pending reception review" — looks like the same app.
 */
export function PhoneFrame({
  statusBarClassName = "bg-blue-700",
  caption,
  children,
}: {
  statusBarClassName?: string;
  caption?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-[280px] shrink-0 overflow-hidden rounded-[2.25rem] border-[10px] border-slate-900 bg-slate-900 shadow-2xl sm:w-[300px]">
        <div className="pointer-events-none absolute left-1/2 top-0 z-10 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-slate-900" />

        <div className="flex h-[70vh] max-h-[600px] min-h-[520px] flex-col overflow-hidden rounded-[1.6rem] bg-white">
          <div className={statusBarClassName}>
            <StatusBar />
          </div>

          <div className="app-fade-in flex flex-1 flex-col overflow-hidden">{children}</div>

          <div className="flex justify-center bg-white pb-1.5 pt-1">
            <div className="h-1 w-28 rounded-full bg-slate-300" />
          </div>
        </div>
      </div>
      {caption && <p className="text-xs text-slate-400">{caption}</p>}
    </div>
  );
}
