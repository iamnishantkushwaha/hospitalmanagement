import { redirect } from "next/navigation";
import { Calendar, Phone, UserCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkRegistrationForm } from "@/components/reception/LinkRegistrationForm";
import { createPatientFromPendingAction } from "@/lib/actions/patient-registration-actions";

export default async function PatientRegistrationsPage() {
  const session = await auth();
  if (!session?.user || !["ADMIN", "RECEPTIONIST"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  const pending = await db.pendingPatientRegistration.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Self-registrations"
        description={`${pending.length} patient app sign-up${pending.length === 1 ? "" : "s"} waiting to be linked`}
      />

      {pending.length === 0 ? (
        <Card>
          <EmptyState
            icon={UserCheck}
            title="Nothing to review"
            description="Every self-registration has been matched automatically or linked here."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {pending.map((p) => (
            <Card key={p.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {p.firstName} {p.lastName}
                  </p>
                  <p className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {p.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {new Date(p.dateOfBirth).toLocaleDateString()}
                    </span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">Registered {new Date(p.createdAt).toLocaleString()}</p>
                </div>
                <form action={createPatientFromPendingAction.bind(null, p.id)}>
                  <button type="submit" className="rounded-md bg-blue-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-800">
                    Create new patient record
                  </button>
                </form>
              </div>

              <LinkRegistrationForm pendingId={p.id} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
