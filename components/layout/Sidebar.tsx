"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, HOSPITAL_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { UserRole } from "@prisma/client";

export function Sidebar({ role, onNavigate }: { role: UserRole; onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-200">
      <div className="border-b border-slate-800 px-5 pb-4 pt-5">
        <Image
          src="/adrs-logo-light.png"
          alt="ADRS Techno – Innovative & Tech"
          width={470}
          height={220}
          priority
          className="mx-auto h-auto w-full max-w-[160px]"
        />
        <p className="mt-3 truncate border-t border-slate-800 pt-3 text-center text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
          {HOSPITAL_NAME}
        </p>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-blue-700 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
