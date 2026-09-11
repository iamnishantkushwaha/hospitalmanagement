import { PageHeader } from "@/components/layout/PageHeader";
import { IpdTabs } from "@/components/ipd/IpdTabs";

export default function IpdLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <PageHeader title="IPD" description="Admissions, wards, rooms and bed occupancy." />
      <IpdTabs />
      <div>{children}</div>
    </div>
  );
}
