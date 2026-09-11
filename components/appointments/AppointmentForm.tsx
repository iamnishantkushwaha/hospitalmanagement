"use client";

import { useActionState, useMemo, useState } from "react";
import { createAppointmentAction } from "@/lib/actions/appointment-actions";
import { Card, CardBody } from "@/components/ui/Card";
import type { Department, Doctor, User } from "@prisma/client";

const TIME_SLOTS = ["09:00-09:30", "09:30-10:00", "10:00-10:30", "10:30-11:00", "11:00-11:30", "14:00-14:30", "14:30-15:00", "15:00-15:30", "16:00-16:30", "16:30-17:00"];

const inputClass =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600";

type PatientOption = { id: string; firstName: string; lastName: string; mrn: string };
type DoctorOption = Doctor & { user: User; department: Department };

export function AppointmentForm({ patients, doctors }: { patients: PatientOption[]; doctors: DoctorOption[] }) {
  const [state, formAction, isPending] = useActionState(createAppointmentAction, undefined);
  const errors = state?.fieldErrors ?? {};
  const [departmentId, setDepartmentId] = useState<string>("");

  const departments = useMemo(() => {
    const map = new Map<string, Department>();
    for (const doc of doctors) map.set(doc.department.id, doc.department);
    return Array.from(map.values());
  }, [doctors]);

  const filteredDoctors = departmentId ? doctors.filter((d) => d.departmentId === departmentId) : doctors;

  return (
    <form action={formAction}>
      <Card>
        <CardBody className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="patientId">Patient</label>
            <select id="patientId" name="patientId" required className={inputClass} defaultValue="">
              <option value="" disabled>Select patient</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} ({p.mrn})
                </option>
              ))}
            </select>
            {errors.patientId && <p className="text-xs text-red-600">{errors.patientId}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="departmentFilter">Department</label>
            <select
              id="departmentFilter"
              className={inputClass}
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
            >
              <option value="">All departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="doctorId">Doctor</label>
            <select id="doctorId" name="doctorId" required className={inputClass} defaultValue="">
              <option value="" disabled>Select doctor</option>
              {filteredDoctors.map((d) => (
                <option key={d.id} value={d.id}>
                  Dr. {d.user.name} — {d.specialization} ({d.department.name})
                </option>
              ))}
            </select>
            {errors.doctorId && <p className="text-xs text-red-600">{errors.doctorId}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700" htmlFor="scheduledDate">Date</label>
              <input id="scheduledDate" name="scheduledDate" type="date" required className={inputClass} />
              {errors.scheduledDate && <p className="text-xs text-red-600">{errors.scheduledDate}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700" htmlFor="timeSlot">Time Slot</label>
              <select id="timeSlot" name="timeSlot" required className={inputClass} defaultValue="">
                <option value="" disabled>Select time</option>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
              {errors.timeSlot && <p className="text-xs text-red-600">{errors.timeSlot}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="reason">Reason for visit</label>
            <textarea id="reason" name="reason" rows={2} className={inputClass} />
          </div>

          {state?.error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {isPending ? "Booking..." : "Book Appointment"}
            </button>
          </div>
        </CardBody>
      </Card>
    </form>
  );
}
