"use client";

import { useActionState } from "react";
import { createPatientAction } from "@/lib/actions/patient-actions";
import { Card, CardBody } from "@/components/ui/Card";

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600";

export function PatientForm() {
  const [state, formAction, isPending] = useActionState(createPatientAction, undefined);
  const errors = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardBody className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Basic Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="First name" name="firstName" error={errors.firstName}>
              <input id="firstName" name="firstName" required className={inputClass} />
            </Field>
            <Field label="Last name" name="lastName" error={errors.lastName}>
              <input id="lastName" name="lastName" required className={inputClass} />
            </Field>
            <Field label="Date of birth" name="dateOfBirth" error={errors.dateOfBirth}>
              <input id="dateOfBirth" name="dateOfBirth" type="date" className={inputClass} />
            </Field>
            <Field label="Gender" name="gender" error={errors.gender}>
              <select id="gender" name="gender" className={inputClass} defaultValue="">
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </Field>
            <Field label="Blood group" name="bloodGroup" error={errors.bloodGroup}>
              <select id="bloodGroup" name="bloodGroup" className={inputClass} defaultValue="">
                <option value="">Select blood group</option>
                {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </Field>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Contact Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Phone" name="phone" error={errors.phone}>
              <input id="phone" name="phone" type="tel" className={inputClass} />
            </Field>
            <Field label="Email" name="email" error={errors.email}>
              <input id="email" name="email" type="email" className={inputClass} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Address" name="address" error={errors.address}>
                <textarea id="address" name="address" rows={2} className={inputClass} />
              </Field>
            </div>
            <Field label="Emergency contact name" name="emergencyContactName" error={errors.emergencyContactName}>
              <input id="emergencyContactName" name="emergencyContactName" className={inputClass} />
            </Field>
            <Field label="Emergency contact phone" name="emergencyContactPhone" error={errors.emergencyContactPhone}>
              <input id="emergencyContactPhone" name="emergencyContactPhone" type="tel" className={inputClass} />
            </Field>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Medical Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Allergies" name="allergies" error={errors.allergies}>
              <input id="allergies" name="allergies" placeholder="e.g. Penicillin, Peanuts" className={inputClass} />
            </Field>
            <Field label="Existing conditions" name="existingConditions" error={errors.existingConditions}>
              <input id="existingConditions" name="existingConditions" placeholder="e.g. Diabetes, Hypertension" className={inputClass} />
            </Field>
          </div>
        </CardBody>
      </Card>

      {state?.error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {isPending ? "Registering..." : "Register Patient"}
        </button>
      </div>
    </form>
  );
}
