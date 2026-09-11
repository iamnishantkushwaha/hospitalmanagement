import { PageHeader } from "@/components/layout/PageHeader";
import { BillingTabs } from "@/components/billing/BillingTabs";

export default function BillingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <PageHeader title="Billing" description="Invoices, charges, payments and receipts." />
      <BillingTabs />
      <div>{children}</div>
    </div>
  );
}
