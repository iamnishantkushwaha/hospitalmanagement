import Link from "next/link";
import { Clock3, LogOut, X } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logoutAction } from "@/lib/actions/auth-actions";
import { PatientAppDemo, type DemoPatient } from "@/components/app-demo/PatientAppDemo";
import { PatientAuthFlow } from "@/components/app-demo/PatientAuthFlow";
import { PhoneFrame } from "@/components/app-demo/PhoneFrame";
import {
  PatientPortalApp,
  type PortalPatient,
  type PortalDoctor,
  type PortalAppointment,
  type PortalPrescription,
  type PortalDischarge,
  type PortalLabReport,
  type PortalInvoice,
  type PortalFamilyMember,
} from "@/components/app-demo/PatientPortalApp";

function calculateAge(dob: Date | null): string {
  if (!dob) return "—";
  const diff = Date.now() - dob.getTime();
  const age = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  return `${age} yrs`;
}

function dateLabel(d: Date) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

async function getPatientPortalData(userId: string) {
  const patient = await db.patient.findUnique({
    where: { userId },
    include: {
      contacts: true,
      appointments: {
        include: { doctor: { include: { user: true } }, department: true },
        orderBy: { scheduledDate: "desc" },
      },
      prescriptions: {
        include: { items: true, doctor: { include: { user: true } } },
        orderBy: { createdAt: "desc" },
      },
      admissions: {
        include: { discharge: true, doctor: { include: { user: true } } },
        orderBy: { admissionDate: "desc" },
      },
      labOrders: {
        include: { tests: { include: { labTest: true, result: true } } },
        orderBy: { orderedAt: "desc" },
      },
      invoices: {
        include: { items: true, payments: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!patient) return null;

  const doctorsRaw = await db.doctor.findMany({
    include: { user: true, department: true },
    orderBy: { user: { name: "asc" } },
    take: 30,
  });

  const patientOut: PortalPatient = {
    id: patient.id,
    mrn: patient.mrn,
    firstName: patient.firstName,
    lastName: patient.lastName,
    ageLabel: calculateAge(patient.dateOfBirth),
    gender: patient.gender,
    phone: patient.phone,
    email: patient.email,
    address: patient.address,
    bloodGroup: patient.bloodGroup,
    allergies: patient.allergies,
    existingConditions: patient.existingConditions,
  };

  const doctors: PortalDoctor[] = doctorsRaw.map((d) => ({
    id: d.id,
    name: d.user.name ?? "Doctor",
    department: d.department.name,
    fee: Number(d.consultationFee),
    slotStart: d.slotStartTime,
    slotEnd: d.slotEndTime,
  }));

  const appointments: PortalAppointment[] = patient.appointments.map((a) => ({
    id: a.id,
    appointmentNo: a.appointmentNo,
    doctorName: a.doctor.user.name ?? "Doctor",
    department: a.department.name,
    dateLabel: dateLabel(a.scheduledDate),
    dateValue: new Date(a.scheduledDate).toISOString().slice(0, 10),
    timeSlot: a.timeSlot,
    status: a.status,
    reason: a.reason,
    canJoin: a.status === "SCHEDULED",
  }));

  const prescriptions: PortalPrescription[] = patient.prescriptions.map((p) => ({
    id: p.id,
    doctorName: p.doctor.user.name ?? "Doctor",
    dateLabel: dateLabel(p.createdAt),
    notes: p.notes,
    items: p.items.map((i) => ({
      medicineName: i.medicineName,
      dosage: i.dosage,
      frequency: i.frequency,
      durationDays: i.durationDays,
      instructions: i.instructions,
    })),
  }));

  const discharges: PortalDischarge[] = patient.admissions
    .filter((a) => a.discharge)
    .map((a) => ({
      id: a.id,
      admissionNo: a.admissionNo,
      doctorName: a.doctor.user.name ?? "Doctor",
      admissionDateLabel: dateLabel(a.admissionDate),
      dischargeDateLabel: dateLabel(a.discharge!.dischargeDate),
      summary: a.discharge!.summary,
    }));

  const labReports: PortalLabReport[] = patient.labOrders.map((o) => ({
    id: o.id,
    orderNo: o.orderNo,
    dateLabel: dateLabel(o.orderedAt),
    status: o.status,
    tests: o.tests.map((t) => ({
      name: t.labTest.name,
      result: t.result?.resultValue ?? null,
      isNormal: t.result?.isNormal ?? null,
    })),
  }));

  const invoices: PortalInvoice[] = patient.invoices.map((inv) => {
    const paid = inv.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const total = Number(inv.totalAmt);
    const settled = inv.status === "PAID" || inv.status === "CANCELLED";
    return {
      id: inv.id,
      invoiceNo: inv.invoiceNo,
      dateLabel: dateLabel(inv.createdAt),
      status: inv.status,
      total,
      paid,
      due: settled ? 0 : Math.max(total - paid, 0),
      items: inv.items.map((it) => ({
        description: it.description,
        quantity: it.quantity,
        amount: Number(it.amount),
      })),
    };
  });

  const familyMembers: PortalFamilyMember[] = patient.contacts.map((c) => ({
    id: c.id,
    name: c.name,
    relation: c.relation,
    phone: c.phone,
  }));

  return { patient: patientOut, doctors, appointments, prescriptions, discharges, labReports, invoices, familyMembers };
}

export default async function PatientAppPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <PatientAuthFlow />
      </div>
    );
  }

  const isPatient = session.user.role === "PATIENT";

  if (isPatient && session?.user?.id) {
    const data = await getPatientPortalData(session.user.id);
    if (data) {
      return (
        <div className="relative flex h-full w-full items-center justify-center">
          <form action={logoutAction} className="absolute right-4 top-4 z-20">
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 backdrop-blur transition hover:bg-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              Log out
            </button>
          </form>

          <PatientPortalApp
            patient={data.patient}
            appointments={data.appointments}
            doctors={data.doctors}
            prescriptions={data.prescriptions}
            discharges={data.discharges}
            labReports={data.labReports}
            invoices={data.invoices}
            familyMembers={data.familyMembers}
          />
        </div>
      );
    }

    // Self-registered but not yet matched or linked by Reception.
    const pending = await db.pendingPatientRegistration.findUnique({ where: { userId: session.user.id } });
    return (
      <div className="relative flex h-full w-full items-center justify-center px-4">
        <form action={logoutAction} className="absolute right-4 top-4 z-20">
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 backdrop-blur transition hover:bg-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            Log out
          </button>
        </form>

        <PhoneFrame statusBarClassName="bg-amber-600" caption="This is your patient app — pending reception review.">
          <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-6 py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <Clock3 className="h-6 w-6" />
            </div>
            <h1 className="mt-3 text-base font-semibold text-slate-900">Almost there</h1>
            <p className="mt-2 text-sm text-slate-500">
              {pending
                ? `We couldn't automatically match ${pending.firstName} ${pending.lastName} (${pending.phone}) to an existing hospital record. A receptionist will review and link your account shortly.`
                : "Your account isn't linked to a patient record yet. A receptionist will review and link it shortly."}
            </p>
            <p className="mt-3 text-xs text-slate-400">You can close this and check back later, or contact the front desk.</p>
          </div>
        </PhoneFrame>
      </div>
    );
  }

  // Staff preview: browse-all-patients demo.
  const patients = await db.patient.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const demoPatients: DemoPatient[] = patients.map((p) => ({
    id: p.id,
    mrn: p.mrn,
    firstName: p.firstName,
    lastName: p.lastName,
    ageLabel: calculateAge(p.dateOfBirth),
    gender: p.gender,
    phone: p.phone,
    email: p.email,
    address: p.address,
    bloodGroup: p.bloodGroup,
    allergies: p.allergies,
    existingConditions: p.existingConditions,
    registeredLabel: new Date(p.createdAt).toLocaleDateString(),
  }));

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <Link
        href="/dashboard"
        className="absolute right-4 top-4 z-20 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 backdrop-blur transition hover:bg-white"
      >
        <X className="h-3.5 w-3.5" />
        Close demo
      </Link>

      <PatientAppDemo patients={demoPatients} />
    </div>
  );
}
