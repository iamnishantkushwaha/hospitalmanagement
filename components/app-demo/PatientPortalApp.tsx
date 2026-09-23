"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import {
  Home as HomeIcon,
  CalendarDays,
  FileText,
  Receipt,
  User,
  Plus,
  ChevronLeft,
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Download,
  Clock,
  Wifi,
  Signal,
  BatteryFull,
  UserPlus,
  Pill,
  FlaskConical,
  HeartPulse,
  CreditCard,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  bookAppointmentAction,
  rescheduleAppointmentAction,
  cancelAppointmentAction,
  addFamilyMemberAction,
  payInvoiceAction,
  type PortalActionState,
} from "@/lib/actions/patient-portal-actions";

export type PortalPatient = {
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
};

export type PortalDoctor = {
  id: string;
  name: string;
  department: string;
  fee: number;
  slotStart: string | null;
  slotEnd: string | null;
};

export type PortalAppointment = {
  id: string;
  appointmentNo: string;
  doctorName: string;
  department: string;
  dateLabel: string;
  dateValue: string;
  timeSlot: string;
  status: string;
  reason: string | null;
  canJoin: boolean;
};

export type PortalPrescriptionItem = {
  medicineName: string;
  dosage: string | null;
  frequency: string | null;
  durationDays: number | null;
  instructions: string | null;
};

export type PortalPrescription = {
  id: string;
  doctorName: string;
  dateLabel: string;
  notes: string | null;
  items: PortalPrescriptionItem[];
};

export type PortalDischarge = {
  id: string;
  admissionNo: string;
  doctorName: string;
  admissionDateLabel: string;
  dischargeDateLabel: string;
  summary: string | null;
};

export type PortalLabReport = {
  id: string;
  orderNo: string;
  dateLabel: string;
  status: string;
  tests: { name: string; result: string | null; isNormal: boolean | null }[];
};

export type PortalInvoiceItem = { description: string; quantity: number; amount: number };

export type PortalInvoice = {
  id: string;
  invoiceNo: string;
  dateLabel: string;
  status: string;
  total: number;
  paid: number;
  due: number;
  items: PortalInvoiceItem[];
};

export type PortalFamilyMember = { id: string; name: string; relation: string | null; phone: string | null };

type Tab = "home" | "visits" | "records" | "billing" | "profile";

function initials(first: string, last: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

function downloadText(filename: string, content: string) {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

type Tone = "green" | "amber" | "red" | "slate" | "blue";

function StatusPill({ label, tone }: { label: string; tone: Tone }) {
  const toneClasses: Record<Tone, string> = {
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    slate: "bg-slate-100 text-slate-600",
    blue: "bg-blue-50 text-blue-700",
  };
  return <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", toneClasses[tone])}>{label}</span>;
}

function appointmentTone(status: string): Tone {
  if (status === "SCHEDULED") return "blue";
  if (status === "CHECKED_IN" || status === "IN_CONSULTATION") return "amber";
  if (status === "COMPLETED") return "green";
  return "red";
}

function invoiceTone(status: string): Tone {
  if (status === "PAID") return "green";
  if (status === "PARTIALLY_PAID") return "blue";
  if (status === "PENDING") return "amber";
  return "red";
}

function labTone(status: string): Tone {
  if (status === "VERIFIED") return "green";
  if (status === "RESULT_ENTERED") return "blue";
  if (status === "PROCESSING") return "amber";
  return "slate";
}

function money(n: number) {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
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

function TopBar({ title, onBack }: { title: string; onBack?: () => void }) {
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
    { key: "visits", label: "Visits", icon: CalendarDays },
    { key: "records", label: "Records", icon: FileText },
    { key: "billing", label: "Billing", icon: Receipt },
    { key: "profile", label: "Profile", icon: User },
  ];
  return (
    <div className="flex border-t border-slate-200 bg-white px-0.5 pb-2 pt-1.5">
      {items.map(({ key, label, icon: Icon }) => {
        const active = tab === key;
        return (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[9px] font-medium"
          >
            <Icon className={cn("h-[18px] w-[18px]", active ? "text-blue-700" : "text-slate-400")} />
            <span className={active ? "text-blue-700" : "text-slate-400"}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200", className)}>{children}</div>;
}

function FormMessage({ state }: { state: PortalActionState }) {
  if (!state?.error && !state?.success) return null;
  return (
    <p
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs",
        state.error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
      )}
    >
      {state.error ? <AlertCircle className="h-3.5 w-3.5 shrink-0" /> : <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
      {state.error ?? state.success}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------

function HomeScreen({
  patient,
  appointments,
  prescriptions,
  invoices,
  goTo,
}: {
  patient: PortalPatient;
  appointments: PortalAppointment[];
  prescriptions: PortalPrescription[];
  invoices: PortalInvoice[];
  goTo: (t: Tab) => void;
}) {
  const nextAppointment = appointments.find((a) => a.status === "SCHEDULED");
  const pendingDue = invoices.reduce((sum, inv) => sum + (inv.status === "PAID" || inv.status === "CANCELLED" ? 0 : inv.due), 0);

  return (
    <div className="no-scrollbar flex-1 overflow-y-auto bg-slate-50 px-4 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-700 text-sm font-semibold text-white">
          {initials(patient.firstName, patient.lastName)}
        </div>
        <div>
          <p className="text-[11px] text-slate-500">Welcome back</p>
          <p className="text-sm font-semibold text-slate-900">
            {patient.firstName} {patient.lastName}
          </p>
        </div>
      </div>

      <button
        onClick={() => goTo("visits")}
        className="mt-4 w-full rounded-xl bg-blue-700 p-3.5 text-left text-white shadow-sm active:bg-blue-800"
      >
        {nextAppointment ? (
          <>
            <p className="text-[11px] font-medium text-blue-100">Your next appointment</p>
            <p className="mt-0.5 text-sm font-semibold">{nextAppointment.doctorName}</p>
            <p className="text-xs text-blue-100">
              {nextAppointment.dateLabel} · {nextAppointment.timeSlot}
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold">No upcoming appointments</p>
            <p className="text-xs text-blue-100">Tap to book one</p>
          </>
        )}
      </button>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Card className="text-center">
          <p className="text-xl font-bold text-slate-900">{prescriptions.length}</p>
          <p className="text-[10px] text-slate-500">Prescriptions</p>
        </Card>
        <Card className="text-center">
          <p className="text-xl font-bold text-slate-900">{money(pendingDue)}</p>
          <p className="text-[10px] text-slate-500">Bills due</p>
        </Card>
      </div>

      <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">Quick actions</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button onClick={() => goTo("visits")} className="flex items-center gap-2 rounded-xl bg-white p-3 text-left shadow-sm ring-1 ring-slate-200 active:bg-slate-50">
          <CalendarDays className="h-4 w-4 text-blue-700" />
          <span className="text-xs font-medium text-slate-700">Book visit</span>
        </button>
        <button onClick={() => goTo("records")} className="flex items-center gap-2 rounded-xl bg-white p-3 text-left shadow-sm ring-1 ring-slate-200 active:bg-slate-50">
          <FileText className="h-4 w-4 text-blue-700" />
          <span className="text-xs font-medium text-slate-700">Records</span>
        </button>
        <button onClick={() => goTo("billing")} className="flex items-center gap-2 rounded-xl bg-white p-3 text-left shadow-sm ring-1 ring-slate-200 active:bg-slate-50">
          <Receipt className="h-4 w-4 text-blue-700" />
          <span className="text-xs font-medium text-slate-700">Pay bills</span>
        </button>
        <button onClick={() => goTo("profile")} className="flex items-center gap-2 rounded-xl bg-white p-3 text-left shadow-sm ring-1 ring-slate-200 active:bg-slate-50">
          <User className="h-4 w-4 text-blue-700" />
          <span className="text-xs font-medium text-slate-700">Family</span>
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Visits (appointments, booking, reschedule, teleconsultation)
// ---------------------------------------------------------------------------

function BookAppointmentForm({ doctors, onDone }: { doctors: PortalDoctor[]; onDone: () => void }) {
  const [state, formAction, isPending] = useActionState<PortalActionState, FormData>(bookAppointmentAction, undefined);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (state?.success) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="no-scrollbar flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">Doctor</label>
        <select name="doctorId" required className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-800">
          <option value="">Select a doctor</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} — {d.department}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">Date</label>
        <input type="date" name="date" required min={today} className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-800" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">Time</label>
        <input type="time" name="timeSlot" required className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-800" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">Reason (optional)</label>
        <textarea name="reason" rows={2} className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-800" placeholder="e.g. Follow-up, fever" />
      </div>

      <FormMessage state={state} />

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-blue-700 px-3 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {isPending ? "Booking..." : "Confirm booking"}
      </button>
      <button type="button" onClick={onDone} className="w-full text-center text-xs text-slate-500">
        Back
      </button>
    </form>
  );
}

function RescheduleForm({ appointment, onDone }: { appointment: PortalAppointment; onDone: () => void }) {
  const [state, formAction, isPending] = useActionState<PortalActionState, FormData>(rescheduleAppointmentAction, undefined);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (state?.success) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="no-scrollbar flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
      <input type="hidden" name="appointmentId" value={appointment.id} />
      <Card>
        <p className="text-sm font-medium text-slate-800">{appointment.doctorName}</p>
        <p className="text-xs text-slate-500">{appointment.department}</p>
      </Card>
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">New date</label>
        <input type="date" name="date" required min={today} defaultValue={appointment.dateValue} className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-800" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">New time</label>
        <input type="time" name="timeSlot" required className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-800" />
      </div>

      <FormMessage state={state} />

      <button type="submit" disabled={isPending} className="w-full rounded-lg bg-blue-700 px-3 py-2.5 text-sm font-medium text-white disabled:opacity-60">
        {isPending ? "Saving..." : "Confirm new time"}
      </button>
      <button type="button" onClick={onDone} className="w-full text-center text-xs text-slate-500">
        Back
      </button>
    </form>
  );
}

function CallScreen({ appointment, onEnd }: { appointment: PortalAppointment; onEnd: () => void }) {
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="flex flex-1 flex-col items-center justify-between bg-slate-900 px-6 py-8 text-white">
      <div className="flex flex-col items-center gap-3 pt-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-700 text-2xl font-semibold">
          {appointment.doctorName
            .split(" ")
            .map((p) => p[0])
            .slice(0, 2)
            .join("")}
        </div>
        <p className="text-base font-semibold">{appointment.doctorName}</p>
        <p className="text-xs text-slate-300">{videoOn ? "Video consultation" : "Audio only"} · {mm}:{ss}</p>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setMuted((m) => !m)}
          className={cn("flex h-11 w-11 items-center justify-center rounded-full", muted ? "bg-white text-slate-900" : "bg-white/10 text-white")}
        >
          {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>
        <button
          onClick={() => setVideoOn((v) => !v)}
          className={cn("flex h-11 w-11 items-center justify-center rounded-full", !videoOn ? "bg-white text-slate-900" : "bg-white/10 text-white")}
        >
          {videoOn ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </button>
        <button onClick={onEnd} className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white">
          <PhoneOff className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function AppointmentCard({
  appointment,
  onReschedule,
  onJoin,
}: {
  appointment: PortalAppointment;
  onReschedule: () => void;
  onJoin: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCancel() {
    setError(null);
    startTransition(async () => {
      try {
        await cancelAppointmentAction(appointment.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not cancel.");
      }
    });
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-800">{appointment.doctorName}</p>
          <p className="truncate text-[11px] text-slate-500">{appointment.department}</p>
        </div>
        <StatusPill label={appointment.status.replace("_", " ")} tone={appointmentTone(appointment.status)} />
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
        <Clock className="h-3.5 w-3.5 text-slate-400" />
        {appointment.dateLabel} · {appointment.timeSlot}
      </p>
      {appointment.reason && <p className="mt-1 truncate text-[11px] text-slate-400">Reason: {appointment.reason}</p>}

      {error && <p className="mt-2 text-[11px] text-red-600">{error}</p>}

      {appointment.status === "SCHEDULED" && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {appointment.canJoin && (
            <button onClick={onJoin} className="flex items-center gap-1 rounded-lg bg-blue-700 px-2.5 py-1.5 text-[11px] font-medium text-white">
              <Phone className="h-3 w-3" /> Join
            </button>
          )}
          <button onClick={onReschedule} className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-[11px] font-medium text-slate-600">
            Reschedule
          </button>
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="rounded-lg border border-red-200 px-2.5 py-1.5 text-[11px] font-medium text-red-600 disabled:opacity-60"
          >
            {isPending ? "Cancelling..." : "Cancel"}
          </button>
        </div>
      )}
    </Card>
  );
}

function VisitsScreen({
  appointments,
  doctors,
  view,
  activeId,
  onOpen,
  onClose,
}: {
  appointments: PortalAppointment[];
  doctors: PortalDoctor[];
  view: "list" | "book" | "reschedule" | "call";
  activeId: string | null;
  onOpen: (view: "book" | "reschedule" | "call", activeId?: string) => void;
  onClose: () => void;
}) {
  const active = appointments.find((a) => a.id === activeId) ?? null;

  if (view === "book") {
    return <BookAppointmentForm doctors={doctors} onDone={onClose} />;
  }
  if (view === "reschedule" && active) {
    return <RescheduleForm appointment={active} onDone={onClose} />;
  }
  if (view === "call" && active) {
    return <CallScreen appointment={active} onEnd={onClose} />;
  }

  return (
    <div className="no-scrollbar flex-1 overflow-y-auto bg-slate-50 px-4 py-4">
      <button
        onClick={() => onOpen("book")}
        className="mb-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-700 px-3 py-2 text-sm font-medium text-white active:bg-blue-800"
      >
        <Plus className="h-4 w-4" /> Book appointment
      </button>

      {appointments.length === 0 ? (
        <p className="mt-10 text-center text-xs text-slate-400">No appointments yet.</p>
      ) : (
        <div className="space-y-2">
          {appointments.map((a) => (
            <AppointmentCard
              key={a.id}
              appointment={a}
              onReschedule={() => onOpen("reschedule", a.id)}
              onJoin={() => onOpen("call", a.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Records (prescriptions, discharge summaries, lab reports)
// ---------------------------------------------------------------------------

function RecordsScreen({
  prescriptions,
  discharges,
  labReports,
}: {
  prescriptions: PortalPrescription[];
  discharges: PortalDischarge[];
  labReports: PortalLabReport[];
}) {
  const [sub, setSub] = useState<"prescriptions" | "discharge" | "lab">("prescriptions");

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <div className="flex gap-1.5 bg-blue-700 px-3 pb-3">
        {[
          { key: "prescriptions" as const, label: "Prescriptions", icon: Pill },
          { key: "discharge" as const, label: "Discharge", icon: HeartPulse },
          { key: "lab" as const, label: "Lab reports", icon: FlaskConical },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSub(key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-medium",
              sub === key ? "bg-white text-blue-700" : "bg-blue-800/40 text-blue-100"
            )}
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        ))}
      </div>

      <div className="no-scrollbar flex-1 space-y-2 overflow-y-auto px-3 py-3">
        {sub === "prescriptions" &&
          (prescriptions.length === 0 ? (
            <p className="mt-10 text-center text-xs text-slate-400">No prescriptions yet.</p>
          ) : (
            prescriptions.map((p) => (
              <Card key={p.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{p.doctorName}</p>
                    <p className="text-[11px] text-slate-500">{p.dateLabel}</p>
                  </div>
                  <button
                    onClick={() =>
                      downloadText(
                        `prescription-${p.dateLabel}.txt`,
                        `Prescription\nDoctor: ${p.doctorName}\nDate: ${p.dateLabel}\n\n${p.items
                          .map((i) => `- ${i.medicineName} ${i.dosage ?? ""} ${i.frequency ?? ""} ${i.durationDays ? `for ${i.durationDays} days` : ""}${i.instructions ? ` (${i.instructions})` : ""}`)
                          .join("\n")}${p.notes ? `\n\nNotes: ${p.notes}` : ""}`
                      )
                    }
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-medium text-slate-600"
                  >
                    <Download className="h-3 w-3" /> Save
                  </button>
                </div>
                <ul className="mt-2 space-y-1">
                  {p.items.map((item, i) => (
                    <li key={i} className="text-[11px] text-slate-600">
                      <span className="font-medium text-slate-700">{item.medicineName}</span>
                      {item.dosage ? ` · ${item.dosage}` : ""}
                      {item.frequency ? ` · ${item.frequency}` : ""}
                      {item.durationDays ? ` · ${item.durationDays}d` : ""}
                    </li>
                  ))}
                </ul>
              </Card>
            ))
          ))}

        {sub === "discharge" &&
          (discharges.length === 0 ? (
            <p className="mt-10 text-center text-xs text-slate-400">No discharge summaries yet.</p>
          ) : (
            discharges.map((d) => (
              <Card key={d.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{d.admissionNo}</p>
                    <p className="text-[11px] text-slate-500">
                      {d.admissionDateLabel} → {d.dischargeDateLabel}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      downloadText(
                        `discharge-summary-${d.admissionNo}.txt`,
                        `Discharge Summary\nAdmission: ${d.admissionNo}\nDoctor: ${d.doctorName}\nAdmitted: ${d.admissionDateLabel}\nDischarged: ${d.dischargeDateLabel}\n\n${d.summary ?? "No summary recorded."}`
                      )
                    }
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-medium text-slate-600"
                  >
                    <Download className="h-3 w-3" /> Save
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">Doctor: {d.doctorName}</p>
                {d.summary && <p className="mt-2 text-[11px] text-slate-600">{d.summary}</p>}
              </Card>
            ))
          ))}

        {sub === "lab" &&
          (labReports.length === 0 ? (
            <p className="mt-10 text-center text-xs text-slate-400">No lab reports yet.</p>
          ) : (
            labReports.map((r) => (
              <Card key={r.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{r.orderNo}</p>
                    <p className="text-[11px] text-slate-500">{r.dateLabel}</p>
                  </div>
                  <StatusPill label={r.status.replace("_", " ")} tone={labTone(r.status)} />
                </div>
                <ul className="mt-2 space-y-1">
                  {r.tests.map((t, i) => (
                    <li key={i} className="flex items-center justify-between text-[11px] text-slate-600">
                      <span>{t.name}</span>
                      <span className={t.isNormal === false ? "font-medium text-red-600" : "text-slate-500"}>{t.result ?? "Pending"}</span>
                    </li>
                  ))}
                </ul>
                {r.status === "VERIFIED" && (
                  <button
                    onClick={() =>
                      downloadText(
                        `lab-report-${r.orderNo}.txt`,
                        `Lab Report ${r.orderNo}\nDate: ${r.dateLabel}\n\n${r.tests.map((t) => `${t.name}: ${t.result ?? "Pending"}${t.isNormal === false ? " (abnormal)" : ""}`).join("\n")}`
                      )
                    }
                    className="mt-2 flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-medium text-slate-600"
                  >
                    <Download className="h-3 w-3" /> Save report
                  </button>
                )}
              </Card>
            ))
          ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Billing
// ---------------------------------------------------------------------------

function InvoiceCard({ invoice }: { invoice: PortalInvoice }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  function handlePay() {
    setError(null);
    startTransition(async () => {
      try {
        await payInvoiceAction(invoice.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Payment failed.");
      }
    });
  }

  return (
    <Card>
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-start justify-between gap-2 text-left">
        <div>
          <p className="text-sm font-medium text-slate-800">{invoice.invoiceNo}</p>
          <p className="text-[11px] text-slate-500">{invoice.dateLabel}</p>
        </div>
        <div className="text-right">
          <StatusPill label={invoice.status.replace("_", " ")} tone={invoiceTone(invoice.status)} />
          <p className="mt-1 text-sm font-semibold text-slate-800">{money(invoice.total)}</p>
        </div>
      </button>

      {open && (
        <ul className="mt-2 space-y-1 border-t border-slate-100 pt-2">
          {invoice.items.map((item, i) => (
            <li key={i} className="flex items-center justify-between text-[11px] text-slate-600">
              <span className="truncate pr-2">
                {item.description} {item.quantity > 1 ? `×${item.quantity}` : ""}
              </span>
              <span className="shrink-0">{money(item.amount)}</span>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-2 text-[11px] text-red-600">{error}</p>}

      {invoice.due > 0 && (
        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-[11px] text-slate-500">Due: <span className="font-semibold text-slate-700">{money(invoice.due)}</span></p>
          <button
            onClick={handlePay}
            disabled={isPending}
            className="flex items-center gap-1 rounded-lg bg-blue-700 px-3 py-1.5 text-[11px] font-medium text-white disabled:opacity-60"
          >
            <CreditCard className="h-3 w-3" /> {isPending ? "Processing..." : "Pay now"}
          </button>
        </div>
      )}
    </Card>
  );
}

function BillingScreen({ invoices }: { invoices: PortalInvoice[] }) {
  return (
    <div className="no-scrollbar flex-1 overflow-y-auto bg-slate-50 px-4 py-4">
      {invoices.length === 0 ? (
        <p className="mt-10 text-center text-xs text-slate-400">No bills yet.</p>
      ) : (
        <div className="space-y-2">
          {invoices.map((inv) => (
            <InvoiceCard key={inv.id} invoice={inv} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Profile (patient details + family members)
// ---------------------------------------------------------------------------

function AddFamilyMemberForm({ onDone }: { onDone: () => void }) {
  const [state, formAction, isPending] = useActionState<PortalActionState, FormData>(addFamilyMemberAction, undefined);

  useEffect(() => {
    if (state?.success) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="mt-2 space-y-2 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
      <input name="name" required placeholder="Full name" className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800" />
      <div className="flex gap-2">
        <input name="relation" placeholder="Relation (e.g. Spouse)" className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800" />
        <input name="phone" placeholder="Phone" className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800" />
      </div>
      <FormMessage state={state} />
      <button type="submit" disabled={isPending} className="w-full rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60">
        {isPending ? "Adding..." : "Add member"}
      </button>
    </form>
  );
}

function ProfileScreen({ patient, familyMembers }: { patient: PortalPatient; familyMembers: PortalFamilyMember[] }) {
  const [showAdd, setShowAdd] = useState(false);

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
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Card className="text-center">
          <p className="text-sm font-semibold text-slate-800">{patient.bloodGroup ?? "—"}</p>
          <p className="text-[10px] text-slate-500">Blood group</p>
        </Card>
        <Card className="text-center">
          <p className="truncate text-sm font-semibold text-slate-800">{patient.allergies ?? "None known"}</p>
          <p className="text-[10px] text-slate-500">Allergies</p>
        </Card>
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Contact</p>
      <Card className="mt-2 space-y-1.5">
        <p className="text-xs text-slate-600">Phone: {patient.phone ?? "Not provided"}</p>
        <p className="text-xs text-slate-600">Email: {patient.email ?? "Not provided"}</p>
        <p className="text-xs text-slate-600">Address: {patient.address ?? "Not provided"}</p>
      </Card>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Family members</p>
        <button onClick={() => setShowAdd((s) => !s)} className="flex items-center gap-1 text-[11px] font-medium text-blue-700">
          <UserPlus className="h-3.5 w-3.5" /> Add
        </button>
      </div>

      {showAdd && <AddFamilyMemberForm onDone={() => setShowAdd(false)} />}

      <div className="mt-2 space-y-2">
        {familyMembers.length === 0 ? (
          <p className="text-center text-xs text-slate-400">No family members added.</p>
        ) : (
          familyMembers.map((m) => (
            <Card key={m.id} className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                {m.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">{m.name}</p>
                <p className="truncate text-[11px] text-slate-500">
                  {m.relation ?? "Family member"}
                  {m.phone ? ` · ${m.phone}` : ""}
                </p>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function PatientPortalApp({
  patient,
  appointments,
  doctors,
  prescriptions,
  discharges,
  labReports,
  invoices,
  familyMembers,
}: {
  patient: PortalPatient;
  appointments: PortalAppointment[];
  doctors: PortalDoctor[];
  prescriptions: PortalPrescription[];
  discharges: PortalDischarge[];
  labReports: PortalLabReport[];
  invoices: PortalInvoice[];
  familyMembers: PortalFamilyMember[];
}) {
  type VisitsView = "list" | "book" | "reschedule" | "call";

  const [tab, setTab] = useState<Tab>("home");
  const [visitsView, setVisitsView] = useState<VisitsView>("list");
  const [visitsActiveId, setVisitsActiveId] = useState<string | null>(null);

  function goToTab(t: Tab) {
    setTab(t);
    setVisitsView("list");
    setVisitsActiveId(null);
  }

  const openVisits = (view: Exclude<VisitsView, "list">, activeId?: string) => {
    setVisitsView(view);
    setVisitsActiveId(activeId ?? null);
  };
  const closeVisits = () => {
    setVisitsView("list");
    setVisitsActiveId(null);
  };

  const title =
    tab === "home" ? "Sunrise Hospital" : tab === "visits" ? "Visits" : tab === "records" ? "Records" : tab === "billing" ? "Billing" : "Profile";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-[280px] shrink-0 overflow-hidden rounded-[2.25rem] border-[10px] border-slate-900 bg-slate-900 shadow-2xl sm:w-[300px]">
        <div className="pointer-events-none absolute left-1/2 top-0 z-10 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-slate-900" />

        <div className="flex h-[70vh] max-h-[600px] min-h-[520px] flex-col overflow-hidden rounded-[1.6rem] bg-white">
          <div className="bg-blue-700">
            <StatusBar />
          </div>

          <TopBar title={title} />

          <div key={tab} className="app-fade-in flex flex-1 flex-col overflow-hidden">
            {tab === "home" && (
              <HomeScreen patient={patient} appointments={appointments} prescriptions={prescriptions} invoices={invoices} goTo={goToTab} />
            )}
            {tab === "visits" && (
              <VisitsScreen
                appointments={appointments}
                doctors={doctors}
                view={visitsView}
                activeId={visitsActiveId}
                onOpen={openVisits}
                onClose={closeVisits}
              />
            )}
            {tab === "records" && <RecordsScreen prescriptions={prescriptions} discharges={discharges} labReports={labReports} />}
            {tab === "billing" && <BillingScreen invoices={invoices} />}
            {tab === "profile" && <ProfileScreen patient={patient} familyMembers={familyMembers} />}
          </div>

          <BottomNav tab={tab} setTab={goToTab} />

          <div className="flex justify-center bg-white pb-1.5 pt-1">
            <div className="h-1 w-28 rounded-full bg-slate-300" />
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-400">This is your patient app — book visits, view records and pay bills.</p>
    </div>
  );
}
