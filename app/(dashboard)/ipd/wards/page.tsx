import { db } from "@/lib/db";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";

export default async function WardsPage() {
  const wards = await db.ward.findMany({
    include: { rooms: { include: { beds: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {wards.map((ward) => {
        const beds = ward.rooms.flatMap((r) => r.beds);
        const occupied = beds.filter((b) => b.status === "OCCUPIED").length;
        const available = beds.filter((b) => b.status === "AVAILABLE").length;
        const occupancyPct = beds.length > 0 ? Math.round((occupied / beds.length) * 100) : 0;

        return (
          <Card key={ward.id}>
            <CardHeader>
              <p className="font-medium text-slate-800">{ward.name}</p>
              <p className="text-xs text-slate-500">{ward.type}</p>
            </CardHeader>
            <CardBody className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Occupancy</span>
                  <span>{occupancyPct}%</span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-blue-700" style={{ width: `${occupancyPct}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-md bg-slate-50 py-1.5">
                  <p className="font-semibold text-slate-800">{ward.rooms.length}</p>
                  <p className="text-slate-500">Rooms</p>
                </div>
                <div className="rounded-md bg-emerald-50 py-1.5">
                  <p className="font-semibold text-emerald-700">{available}</p>
                  <p className="text-emerald-600">Available</p>
                </div>
                <div className="rounded-md bg-rose-50 py-1.5">
                  <p className="font-semibold text-rose-700">{occupied}</p>
                  <p className="text-rose-600">Occupied</p>
                </div>
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
