import { PageHeader } from "@/components/layout/PageHeader";
import { PatientForm } from "@/components/patients/PatientForm";

export default function NewPatientPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="New Patient" description="Register a new patient in the system." />
      <PatientForm />
    </div>
  );
}
