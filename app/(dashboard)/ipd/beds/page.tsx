import { db } from "@/lib/db";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<string, string> = {
  AVAILABLE: "bg-emerald-50 border-emerald-200 text-emerald-700",
  OCCUPIED: "bg-rose-50 border-rose-200 text-rose-700",
  RESERVED: "bg-amber-50 border-amber-200 text-amber-700",
  MAINTENANCE: "bg-slate-100 border-slate-200 text-slate-500",
};

export default async function BedsPage() {
  const wards = await db.ward.findMany({
    include: {
      rooms: {
        include: { beds: { include: { admissions: { where: { status: "ADMITTED" }, include: { patient: true }, take: 1 } } } },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(STATUS_STYLE).map(([status, cls]) => (
          <span key={status} className={cn("rounded-full border px-2.5 py-1 font-medium", cls)}>
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </span>
        ))}
      </div>

      {wards.map((ward) => (
        <Card key={ward.id}>
          <CardHeader>
            <p className="text-sm font-semibold text-slate-800">{ward.name}</p>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {ward.rooms.flatMap((room) =>
                room.beds.map((bed) => {
                  const admission = bed.admissions[0];
                  return (
                    <div key={bed.id} className={cn("rounded-lg border p-2.5 text-xs", STATUS_STYLE[bed.status])}>
                      <p className="font-semibold">{bed.bedNo}</p>
                      <p className="mt-0.5 truncate">
                        {admission ? `${admission.patient.firstName} ${admission.patient.lastName}` : bed.status.charAt(0) + bed.status.slice(1).toLowerCase()}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
