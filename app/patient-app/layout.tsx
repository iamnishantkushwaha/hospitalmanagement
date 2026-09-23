// This route is intentionally public: a visitor with no session sees the
// in-app sign-in / register screens (rendered inside the phone frame by
// app/patient-app/page.tsx), matching how a real mobile app's launch screen
// works rather than bouncing out to the website's /login page.
export default function PatientAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200 p-4">
      {children}
    </div>
  );
}
