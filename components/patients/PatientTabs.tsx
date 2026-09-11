"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function PatientTabs({ patientId }: { patientId: string }) {
  const pathname = usePathname();
  const base = `/patients/${patientId}`;

  const tabs = [
    { label: "Overview", href: base },
    { label: "Appointments", href: `${base}/appointments` },
    { label: "Medical Records", href: `${base}/medical-records` },
    { label: "Prescriptions", href: `${base}/prescriptions` },
    { label: "Lab Reports", href: `${base}/lab-reports` },
    { label: "Billing", href: `${base}/billing` },
  ];

  return (
    <div className="border-b border-slate-200">
      <nav className="-mb-px flex gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const active = tab.href === base ? pathname === base : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "border-teal-600 text-teal-700"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
