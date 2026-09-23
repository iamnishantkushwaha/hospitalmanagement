"use client";

import { useMemo, useState } from "react";
import {
  Search,
  ChevronLeft,
  Phone,
  Mail,
  MapPin,
  Droplet,
  AlertTriangle,
  CalendarDays,
  Home as HomeIcon,
  Users,
  User,
  Wifi,
  Signal,
  BatteryFull,
  HeartPulse,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type DemoPatient = {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  ageLabel: string;
  gender: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  bloodGroup: string | null;
  allergies: string | null;
  existingConditions: string | null;
  registeredLabel: string;
};

type Tab = "home" | "patients" | "appointments" | "profile";

function initials(first: string, last: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

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

function AppTopBar({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <div className="flex items-center gap-2 bg-blue-700 px-4 py-3 text-white">
      {onBack && (
        <button onClick={onBack} aria-label="Back" className="-ml-1 rounded-full p-1 hover:bg-white/10">
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      <span className="text-[15px] font-semibold">{title}</span>
    </div>
  );
}

function BottomNav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const items: { key: Tab; label: string; icon: typeof HomeIcon }[] = [
    { key: "home", label: "Home", icon: HomeIcon },
    { key: "patients", label: "Patients", icon: Users },
    { key: "appointments", label: "Visits", icon: CalendarDays },
    { key: "profile", label: "Profile", icon: User },
  ];
  return (
    <div className="flex border-t border-slate-200 bg-white px-1 pb-2 pt-1.5">
      {items.map(({ key, label, icon: Icon }) => {
        const active = tab === key;
        return (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium"
          >
            <Icon className={cn("h-5 w-5", active ? "text-blue-700" : "text-slate-400")} />
            <span className={active ? "text-blue-700" : "text-slate-400"}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function HomeScreen({ patients, goToPatients }: { patients: DemoPatient[]; goToPatients: () => void }) {
  return (
    <div className="no-scrollbar flex-1 overflow-y-auto bg-slate-50 px-4 py-4">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-white">
          <HeartPulse className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[11px] text-slate-500">Welcome back</p>
          <p className="text-sm font-semibold text-slate-900">Sunrise Hospital Staff</p>
        </div>
      </div>

      <button
        onClick={goToPatients}
        className="mt-4 w-full rounded-xl bg-white p-3 text-left shadow-sm ring-1 ring-slate-200 active:bg-slate-50"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-slate-900">{patients.length}</p>
            <p className="text-[11px] text-slate-500">Registered patients</p>
          </div>
          <Users className="h-8 w-8 text-blue-700" />
        </div>
      </button>

      <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">Recently added</p>
      <div className="mt-2 space-y-2">
        {patients.slice(0, 4).map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-slate-200">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
              {initials(p.firstName, p.lastName)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-800">
                {p.firstName} {p.lastName}
              </p>
              <p className="truncate text-[11px] text-slate-500">{p.mrn}</p>
            </div>
          </div>
        ))}
        {patients.length === 0 && (
          <p className="rounded-xl bg-white p-3 text-center text-xs text-slate-400 shadow-sm ring-1 ring-slate-200">
            No patients yet
          </p>
        )}
      </div>
    </div>
  );
}

function PatientsListScreen({
  patients,
  onSelect,
}: {
  patients: DemoPatient[];
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) =>
      [p.firstName, p.lastName, p.mrn, p.phone ?? ""].some((v) => v.toLowerCase().includes(q))
    );
  }, [patients, query]);

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <div className="bg-blue-700 px-4 pb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, MRN or phone"
            className="w-full rounded-lg border-0 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-3 py-3">
        {filtered.length === 0 ? (
          <p className="mt-10 text-center text-xs text-slate-400">No patients found.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => onSelect(p.id)}
                className="flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left shadow-sm ring-1 ring-slate-200 active:bg-slate-50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                  {initials(p.firstName, p.lastName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {p.firstName} {p.lastName}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {p.mrn} · {p.ageLabel}
                    {p.gender ? ` · ${p.gender.charAt(0)}${p.gender.slice(1).toLowerCase()}` : ""}
                  </p>
                </div>
                {p.bloodGroup && (
                  <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                    {p.bloodGroup}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PatientDetailScreen({ patient }: { patient: DemoPatient }) {
  const rows: { icon: typeof Phone; label: string; value: string }[] = [
    { icon: Phone, label: "Phone", value: patient.phone ?? "Not provided" },
    { icon: Mail, label: "Email", value: patient.email ?? "Not provided" },
    { icon: MapPin, label: "Address", value: patient.address ?? "Not provided" },
  ];

  return (
    <div className="no-scrollbar flex-1 overflow-y-auto bg-slate-50 px-4 py-4">
      <div className="flex flex-col items-center rounded-xl bg-white p-5 text-center shadow-sm ring-1 ring-slate-200">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-700 text-lg font-semibold text-white">
          {initials(patient.firstName, patient.lastName)}
        </div>
        <p className="mt-2 text-base font-semibold text-slate-900">
          {patient.firstName} {patient.lastName}
        </p>
        <p className="text-xs text-slate-500">
          {patient.mrn} · {patient.ageLabel}
          {patient.gender ? ` · ${patient.gender.charAt(0)}${patient.gender.slice(1).toLowerCase()}` : ""}
        </p>
        <p className="mt-1 text-[11px] text-slate-400">Registered {patient.registeredLabel}</p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white p-3 text-center shadow-sm ring-1 ring-slate-200">
          <Droplet className="mx-auto h-5 w-5 text-red-500" />
          <p className="mt-1 text-sm font-semibold text-slate-800">{patient.bloodGroup ?? "—"}</p>
          <p className="text-[10px] text-slate-500">Blood group</p>
        </div>
        <div className="rounded-xl bg-white p-3 text-center shadow-sm ring-1 ring-slate-200">
          <AlertTriangle className="mx-auto h-5 w-5 text-amber-500" />
          <p className="mt-1 truncate text-sm font-semibold text-slate-800">{patient.allergies ?? "None known"}</p>
          <p className="text-[10px] text-slate-500">Allergies</p>
        </div>
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Contact</p>
      <div className="mt-2 space-y-2">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
            <Icon className="h-4 w-4 shrink-0 text-slate-400" />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400">{label}</p>
              <p className="truncate text-sm text-slate-700">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {patient.existingConditions && (
        <>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Existing conditions</p>
          <div className="mt-2 rounded-xl bg-white p-3 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200">
            {patient.existingConditions}
          </div>
        </>
      )}
    </div>
  );
}

function PlaceholderScreen({ title }: { title: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 bg-slate-50 px-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
        <CalendarDays className="h-6 w-6" />
      </div>
      <p className="text-sm font-medium text-slate-700">{title}</p>
      <p className="text-xs text-slate-400">This screen is a placeholder in the demo — patients is the working part.</p>
    </div>
  );
}

export function PatientAppDemo({ patients }: { patients: DemoPatient[] }) {
  const [tab, setTab] = useState<Tab>("home");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedPatient = patients.find((p) => p.id === selectedId) ?? null;

  const title =
    tab === "home"
      ? "Sunrise Hospital"
      : tab === "patients"
        ? selectedPatient
          ? "Patient"
          : "Patients"
        : tab === "appointments"
          ? "Visits"
          : "Profile";

  function handleTabChange(next: Tab) {
    setSelectedId(null);
    setTab(next);
  }

  const screenKey = `${tab}-${selectedPatient ? selectedPatient.id : "list"}`;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Phone frame */}
      <div className="relative w-[280px] shrink-0 overflow-hidden rounded-[2.25rem] border-[10px] border-slate-900 bg-slate-900 shadow-2xl sm:w-[300px]">
        {/* Notch */}
        <div className="pointer-events-none absolute left-1/2 top-0 z-10 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-slate-900" />

        <div className="flex h-[70vh] max-h-[600px] min-h-[520px] flex-col overflow-hidden rounded-[1.6rem] bg-white">
          <div className="bg-blue-700">
            <StatusBar />
          </div>

          <AppTopBar
            title={title}
            onBack={tab === "patients" && selectedPatient ? () => setSelectedId(null) : undefined}
          />

          <div key={screenKey} className="app-fade-in flex flex-1 flex-col overflow-hidden">
            {tab === "home" && <HomeScreen patients={patients} goToPatients={() => handleTabChange("patients")} />}

            {tab === "patients" &&
              (selectedPatient ? (
                <PatientDetailScreen patient={selectedPatient} />
              ) : (
                <PatientsListScreen patients={patients} onSelect={setSelectedId} />
              ))}

            {tab === "appointments" && <PlaceholderScreen title="Appointments" />}
            {tab === "profile" && <PlaceholderScreen title="Staff Profile" />}
          </div>

          <BottomNav tab={tab} setTab={handleTabChange} />

          {/* Home indicator */}
          <div className="flex justify-center bg-white pb-1.5 pt-1">
            <div className="h-1 w-28 rounded-full bg-slate-300" />
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-400">Tap around — this is a live preview using your real patient records.</p>
    </div>
  );
}
