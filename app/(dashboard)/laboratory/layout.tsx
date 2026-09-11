import { PageHeader } from "@/components/layout/PageHeader";
import { LabTabs } from "@/components/laboratory/LabTabs";

export default function LaboratoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <PageHeader title="Laboratory" description="Test orders, sample tracking, results and verification." />
      <LabTabs />
      <div>{children}</div>
    </div>
  );
}
