import { Stethoscope } from "lucide-react";
import { db } from "@/lib/db";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function PatientMedicalRecordsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const consultations = await db.consultation.findMany({
    where: { patientId: id },
    include: { doctor: { include: { user: true } }, vitals: true, diagnoses: true },
    orderBy: { createdAt: "desc" },
  });

  if (consultations.length === 0) {
    return (
      <Card>
        <EmptyState icon={Stethoscope} title="No medical records yet" description="Consultation history will appear here." />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {consultations.map((c) => {
        const vital = c.vitals[0];
        return (
          <Card key={c.id}>
            <CardHeader className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">Dr. {c.doctor.user.name}</p>
                <p className="text-xs text-slate-500">{c.createdAt.toLocaleDateString()}</p>
              </div>
              {c.followUpDate && (
                <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">
                  Follow-up: {c.followUpDate.toLocaleDateString()}
                </span>
              )}
            </CardHeader>
            <CardBody className="space-y-3 text-sm">
              {c.chiefComplaint && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Chief Complaint</p>
                  <p className="text-slate-700">{c.chiefComplaint}</p>
                </div>
              )}
              {c.diagnoses.length > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Diagnosis</p>
                  <p className="text-slate-700">{c.diagnoses.map((d) => d.description).join(", ")}</p>
                </div>
              )}
              {vital && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Vitals</p>
                  <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <VitalStat label="Temp" value={vital.temperatureC ? `${vital.temperatureC}°C` : "—"} />
                    <VitalStat label="BP" value={vital.bloodPressure ?? "—"} />
                    <VitalStat label="Pulse" value={vital.pulseBpm ? `${vital.pulseBpm} bpm` : "—"} />
                    <VitalStat label="SpO2" value={vital.spo2 ? `${vital.spo2}%` : "—"} />
                  </div>
                </div>
              )}
              {c.clinicalNotes && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Clinical Notes</p>
                  <p className="text-slate-700">{c.clinicalNotes}</p>
                </div>
              )}
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}

function VitalStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 px-2.5 py-1.5">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}
