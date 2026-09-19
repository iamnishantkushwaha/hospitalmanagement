import { cn } from "@/lib/utils";

const COLOR_MAP: Record<string, string> = {
  // Appointment
  SCHEDULED: "bg-sky-50 text-sky-700 ring-sky-200",
  CHECKED_IN: "bg-amber-50 text-amber-700 ring-amber-200",
  IN_CONSULTATION: "bg-violet-50 text-violet-700 ring-violet-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-slate-100 text-slate-500 ring-slate-200",
  NO_SHOW: "bg-rose-50 text-rose-700 ring-rose-200",
  // Bed / Admission
  AVAILABLE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  OCCUPIED: "bg-rose-50 text-rose-700 ring-rose-200",
  RESERVED: "bg-amber-50 text-amber-700 ring-amber-200",
  MAINTENANCE: "bg-slate-100 text-slate-500 ring-slate-200",
  ADMITTED: "bg-violet-50 text-violet-700 ring-violet-200",
  DISCHARGED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  // Lab
  ORDERED: "bg-sky-50 text-sky-700 ring-sky-200",
  SAMPLE_COLLECTED: "bg-amber-50 text-amber-700 ring-amber-200",
  PROCESSING: "bg-violet-50 text-violet-700 ring-violet-200",
  RESULT_ENTERED: "bg-blue-50 text-blue-800 ring-blue-200",
  VERIFIED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  // Invoice
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  PARTIALLY_PAID: "bg-sky-50 text-sky-700 ring-sky-200",
  PAID: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const LABEL_MAP: Record<string, string> = {
  SCHEDULED: "Scheduled",
  CHECKED_IN: "Checked In",
  IN_CONSULTATION: "In Consultation",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No-show",
  AVAILABLE: "Available",
  OCCUPIED: "Occupied",
  RESERVED: "Reserved",
  MAINTENANCE: "Maintenance",
  ADMITTED: "Admitted",
  DISCHARGED: "Discharged",
  ORDERED: "Ordered",
  SAMPLE_COLLECTED: "Sample Collected",
  PROCESSING: "Processing",
  RESULT_ENTERED: "Result Entered",
  VERIFIED: "Verified",
  PENDING: "Unpaid",
  PARTIALLY_PAID: "Partially Paid",
  PAID: "Paid",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        COLOR_MAP[status] ?? "bg-slate-100 text-slate-600 ring-slate-200"
      )}
    >
      {LABEL_MAP[status] ?? status}
    </span>
  );
}
