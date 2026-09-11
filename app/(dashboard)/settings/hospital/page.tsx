import { db } from "@/lib/db";
import { HospitalProfileForm } from "@/components/settings/HospitalProfileForm";

export default async function HospitalSettingsPage() {
  const hospital = await db.hospital.findFirst();
  if (!hospital) return null;

  return <HospitalProfileForm hospital={hospital} />;
}
