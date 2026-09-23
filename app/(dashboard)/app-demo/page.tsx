import { redirect } from "next/navigation";

// The mobile app demo now lives at its own full-screen route (no dashboard
// chrome around the phone frame). Keep this path working for anyone who
// bookmarked it.
export default function AppDemoRedirectPage() {
  redirect("/patient-app");
}
