"use client";

import { useState } from "react";
import { Menu, Search, Bell, LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth-actions";
import { ROLE_LABELS } from "@/lib/constants";
import type { UserRole } from "@prisma/client";

export function Topbar({
  name,
  role,
  onMenuClick,
}: {
  name: string;
  role: UserRole;
  onMenuClick: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-400 sm:flex">
          <Search className="h-4 w-4" />
          <span>Search patients, doctors, invoices...</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-xs font-semibold text-white">
              {name.slice(0, 1).toUpperCase()}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium leading-tight text-slate-800">{name}</p>
              <p className="text-xs leading-tight text-slate-500">{ROLE_LABELS[role]}</p>
            </div>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-md border border-slate-200 bg-white py-1 shadow-lg">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
