import { CalendarDays, Stethoscope, FlaskConical, Receipt, UserPlus, BedDouble } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { db } from "@/lib/db";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

type TimelineEvent = {
  date: Date;
  icon: LucideIcon;
  label: string;
  detail: string;
};

export default async function PatientOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [patient, appointments, labOrders, invoices, admissions, contacts] = await Promise.all([
    db.patient.findUnique({ where: { id } }),
    db.appointment.findMany({
      where: { patientId: id },
      include: { doctor: { include: { user: true } }, consultation: { include: { diagnoses: true } } },
      orderBy: { scheduledDate: "desc" },
    }),
    db.labOrder.findMany({ where: { patientId: id }, include: { tests: { include: { labTest: true } } } }),
    db.invoice.findMany({ where: { patientId: id }, include: { payments: true } }),
    db.admission.findMany({ where: { patientId: id }, include: { bed: { include: { room: { include: { ward: true } } } } } }),
    db.patientContact.findMany({ where: { patientId: id } }),
  ]);

  if (!patient) return null;

  const events: TimelineEvent[] = [];

  events.push({ date: patient.createdAt, icon: UserPlus, label: "Patient Registered", detail: `MRN ${patient.mrn} created` });

  for (const appt of appointments) {
    events.push({
      date: appt.scheduledDate,
      icon: CalendarDays,
      label: `Appointment with Dr. ${appt.doctor.user.name}`,
      detail: `${appt.timeSlot} · ${appt.status.replace("_", " ").toLowerCase()}`,
    });
    if (appt.consultation) {
      const diagnosis = appt.consultation.diagnoses[0]?.description;
      events.push({
        date: appt.scheduledDate,
        icon: Stethoscope,
        label: "Consultation completed",
        detail: diagnosis ? `Diagnosis: ${diagnosis}` : appt.consultation.chiefComplaint ?? "Consultation recorded",
      });
    }
  }

  for (const order of labOrders) {
    events.push({
      date: order.orderedAt,
      icon: FlaskConical,
      label: `Lab order ${order.orderNo}`,
      detail: `${order.tests.map((t) => t.labTest.name).join(", ")} · ${order.status.replace("_", " ").toLowerCase()}`,
    });
  }

  for (const invoice of invoices) {
    events.push({
      date: invoice.createdAt,
      icon: Receipt,
      label: `Invoice ${invoice.invoiceNo}`,
      detail: `₹${Number(invoice.totalAmt).toLocaleString("en-IN")} · ${invoice.status.replace("_", " ").toLowerCase()}`,
    });
  }

  for (const admission of admissions) {
    events.push({
      date: admission.admissionDate,
      icon: BedDouble,
      label: `Admitted — ${admission.bed.room.ward.name}`,
      detail: `Bed ${admission.bed.bedNo} · ${admission.status.toLowerCase()}`,
    });
  }

  events.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-800">Patient Timeline</h2>
          </CardHeader>
          <CardBody>
            {events.length === 0 ? (
              <EmptyState icon={CalendarDays} title="No activity yet" />
            ) : (
              <ol className="space-y-4">
                {events.slice(0, 20).map((event, idx) => {
                  const Icon = event.icon;
                  return (
                    <li key={idx} className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1 border-b border-slate-100 pb-4 last:border-none last:pb-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-slate-800">{event.label}</p>
                          <span className="shrink-0 text-xs text-slate-400">{event.date.toLocaleDateString()}</span>
                        </div>
                        <p className="mt-0.5 text-sm text-slate-500">{event.detail}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-800">Demographics</h2>
          </CardHeader>
          <CardBody className="space-y-2 text-sm">
            <Row label="Email" value={patient.email} />
            <Row label="Address" value={patient.address} />
            <Row label="Existing conditions" value={patient.existingConditions} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-800">Emergency Contact</h2>
          </CardHeader>
          <CardBody className="space-y-2 text-sm">
            {contacts.length === 0 ? (
              <p className="text-slate-400">No emergency contact on file.</p>
            ) : (
              contacts.map((contact) => (
                <div key={contact.id}>
                  <p className="font-medium text-slate-800">{contact.name}</p>
                  <p className="text-slate-500">{contact.relation} · {contact.phone ?? "—"}</p>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-800">{value ?? "—"}</span>
    </div>
  );
}
