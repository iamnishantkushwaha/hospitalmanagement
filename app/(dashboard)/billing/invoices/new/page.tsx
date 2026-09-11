import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { InvoiceForm } from "@/components/billing/InvoiceForm";

export default async function NewInvoicePage() {
  const patients = await db.patient.findMany({
    orderBy: { firstName: "asc" },
    select: { id: true, firstName: true, lastName: true, mrn: true },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="New Invoice" description="Create a manual invoice for a patient." />
      <InvoiceForm patients={patients} />
    </div>
  );
}
