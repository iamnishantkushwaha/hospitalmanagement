"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createConsultationAction } from "@/lib/actions/consultation-actions";
import { Card, CardBody } from "@/components/ui/Card";
import type { LabTest, Medicine } from "@prisma/client";

const inputClass =
  "w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600";

type PrescriptionRow = {
  medicineId: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  instructions: string;
};

export function ConsultationForm({
  appointmentId,
  medicines,
  labTests,
}: {
  appointmentId: string;
  medicines: Medicine[];
  labTests: LabTest[];
}) {
  const [state, formAction, isPending] = useActionState(createConsultationAction, undefined);
  const [rows, setRows] = useState<PrescriptionRow[]>([]);
  const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set());

  function addRow() {
    setRows((r) => [...r, { medicineId: medicines[0]?.id ?? "", dosage: "1 tablet", frequency: "OD", durationDays: 5, instructions: "After food" }]);
  }
  function updateRow(index: number, patch: Partial<PrescriptionRow>) {
    setRows((r) => r.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }
  function removeRow(index: number) {
    setRows((r) => r.filter((_, i) => i !== index));
  }
  function toggleTest(id: string) {
    setSelectedTests((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <input type="hidden" name="prescriptionItems" value={JSON.stringify(rows)} />
      <input type="hidden" name="labTestIds" value={JSON.stringify(Array.from(selectedTests))} />

      <Card>
        <CardBody className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-800">Vitals</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <LabeledInput label="Temp (°C)" name="temperatureC" type="number" step="0.1" />
            <LabeledInput label="Blood Pressure" name="bloodPressure" placeholder="120/80" />
            <LabeledInput label="Pulse (bpm)" name="pulseBpm" type="number" />
            <LabeledInput label="Resp Rate" name="respRate" type="number" />
            <LabeledInput label="Weight (kg)" name="weightKg" type="number" step="0.1" />
            <LabeledInput label="Height (cm)" name="heightCm" type="number" step="0.1" />
            <LabeledInput label="SpO2 (%)" name="spo2" type="number" />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-800">Clinical Details</h2>
          <LabeledTextarea label="Chief Complaint" name="chiefComplaint" rows={2} />
          <LabeledInput label="Diagnosis *" name="diagnosis" required />
          <LabeledTextarea label="Clinical Notes" name="clinicalNotes" rows={3} />
          <LabeledInput label="Follow-up Date" name="followUpDate" type="date" />
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Prescription</h2>
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Medicine
            </button>
          </div>

          {rows.length === 0 ? (
            <p className="text-sm text-slate-400">No medicines added.</p>
          ) : (
            <div className="space-y-2">
              {rows.map((row, i) => (
                <div key={i} className="grid grid-cols-1 gap-2 rounded-md border border-slate-100 p-2 sm:grid-cols-12 sm:items-center">
                  <select
                    className={`${inputClass} sm:col-span-4`}
                    value={row.medicineId}
                    onChange={(e) => updateRow(i, { medicineId: e.target.value })}
                  >
                    {medicines.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  <input
                    className={`${inputClass} sm:col-span-2`}
                    placeholder="Dosage"
                    value={row.dosage}
                    onChange={(e) => updateRow(i, { dosage: e.target.value })}
                  />
                  <select
                    className={`${inputClass} sm:col-span-2`}
                    value={row.frequency}
                    onChange={(e) => updateRow(i, { frequency: e.target.value })}
                  >
                    {["OD", "BD", "TDS", "QID", "SOS"].map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    className={`${inputClass} sm:col-span-1`}
                    value={row.durationDays}
                    onChange={(e) => updateRow(i, { durationDays: Number(e.target.value) })}
                  />
                  <input
                    className={`${inputClass} sm:col-span-2`}
                    placeholder="Instructions"
                    value={row.instructions}
                    onChange={(e) => updateRow(i, { instructions: e.target.value })}
                  />
                  <button type="button" onClick={() => removeRow(i)} className="text-slate-400 hover:text-rose-600 sm:col-span-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-800">Lab Orders</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {labTests.map((test) => (
              <label key={test.id} className="flex items-center gap-2 rounded-md border border-slate-100 px-2.5 py-1.5 text-sm hover:bg-slate-50">
                <input type="checkbox" checked={selectedTests.has(test.id)} onChange={() => toggleTest(test.id)} className="accent-teal-600" />
                {test.name}
              </label>
            ))}
          </div>
        </CardBody>
      </Card>

      {state?.error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save Consultation"}
        </button>
      </div>
    </form>
  );
}

function LabeledInput({ label, name, ...rest }: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="text-xs font-medium text-slate-600">{label}</label>
      <input id={name} name={name} className={inputClass} {...rest} />
    </div>
  );
}

function LabeledTextarea({ label, name, ...rest }: { label: string; name: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="text-xs font-medium text-slate-600">{label}</label>
      <textarea id={name} name={name} className={inputClass} {...rest} />
    </div>
  );
}
