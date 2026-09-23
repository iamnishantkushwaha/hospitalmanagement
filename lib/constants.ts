import type { UserRole } from "@prisma/client";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarDays,
  ClipboardList,
  BedDouble,
  FlaskConical,
  Pill,
  Receipt,
  BarChart3,
  Settings,
  Smartphone,
  UserCheck,
  type LucideIcon,
} from "lucide-react";

export const HOSPITAL_NAME = "Sunrise Multispeciality Hospital";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
};

const ALL_STAFF_ROLES: UserRole[] = [
  "ADMIN",
  "RECEPTIONIST",
  "DOCTOR",
  "NURSE",
  "LAB_TECHNICIAN",
  "PHARMACIST",
  "BILLING_STAFF",
];

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ALL_STAFF_ROLES },
  { label: "Patients", href: "/patients", icon: Users, roles: ["ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE"] },
  { label: "Doctors", href: "/doctors", icon: Stethoscope, roles: ["ADMIN", "RECEPTIONIST"] },
  { label: "Appointments", href: "/appointments", icon: CalendarDays, roles: ["ADMIN", "RECEPTIONIST", "DOCTOR"] },
  { label: "OPD", href: "/opd", icon: ClipboardList, roles: ["ADMIN", "DOCTOR", "NURSE"] },
  { label: "IPD", href: "/ipd", icon: BedDouble, roles: ["ADMIN", "DOCTOR", "NURSE"] },
  { label: "Laboratory", href: "/laboratory", icon: FlaskConical, roles: ["ADMIN", "DOCTOR", "LAB_TECHNICIAN"] },
  { label: "Pharmacy", href: "/pharmacy", icon: Pill, roles: ["ADMIN", "PHARMACIST"] },
  { label: "Billing", href: "/billing", icon: Receipt, roles: ["ADMIN", "BILLING_STAFF", "RECEPTIONIST"] },
  { label: "Self-registrations", href: "/patient-registrations", icon: UserCheck, roles: ["ADMIN", "RECEPTIONIST"] },
  { label: "Reports", href: "/reports", icon: BarChart3, roles: ["ADMIN"] },
  { label: "Mobile App Demo", href: "/patient-app", icon: Smartphone, roles: [...ALL_STAFF_ROLES, "PATIENT"] },
  { label: "Settings", href: "/settings", icon: Settings, roles: ["ADMIN"] },
];

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrator",
  RECEPTIONIST: "Receptionist",
  DOCTOR: "Doctor",
  NURSE: "Nurse",
  LAB_TECHNICIAN: "Lab Technician",
  PHARMACIST: "Pharmacist",
  BILLING_STAFF: "Billing Staff",
  PATIENT: "Patient",
};

export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Scheduled",
  CHECKED_IN: "Checked In",
  IN_CONSULTATION: "In Consultation",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No-show",
};

export const BED_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Available",
  OCCUPIED: "Occupied",
  RESERVED: "Reserved",
  MAINTENANCE: "Maintenance",
};

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  PENDING: "Unpaid",
  PARTIALLY_PAID: "Partially Paid",
  PAID: "Paid",
  CANCELLED: "Cancelled",
};
