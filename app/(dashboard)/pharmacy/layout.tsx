import { PageHeader } from "@/components/layout/PageHeader";
import { PharmacyTabs } from "@/components/pharmacy/PharmacyTabs";

export default function PharmacyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <PageHeader title="Pharmacy" description="Medicine stock, prescriptions and dispensing." />
      <PharmacyTabs />
      <div>{children}</div>
    </div>
  );
}
