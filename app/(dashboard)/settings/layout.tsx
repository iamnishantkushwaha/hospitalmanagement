import { PageHeader } from "@/components/layout/PageHeader";
import { SettingsTabs } from "@/components/settings/SettingsTabs";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <PageHeader title="Settings" description="Hospital configuration, departments and users." />
      <SettingsTabs />
      <div>{children}</div>
    </div>
  );
}
