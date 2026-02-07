import { CalendarDays, Users, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatsCard } from "@/components/ui/StatsCard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getReportData() {
  const [
    totalEvents,
    completedEvents,
    publishedEvents,
    totalVolunteers,
    totalRsvps,
    totalHours,
    topVolunteers,
  ] = await Promise.all([
    prisma.event.count(),
    prisma.event.count({ where: { status: "COMPLETED" } }),
    prisma.event.count({ where: { status: "PUBLISHED" } }),
    prisma.volunteer.count(),
    prisma.eventRSVP.count({ where: { status: "CONFIRMED" } }),
    prisma.volunteerHours.aggregate({ _sum: { hours: true } }),
    prisma.volunteer.findMany({
      include: { _count: { select: { rsvps: true } } },
      orderBy: { rsvps: { _count: "desc" } },
      take: 10,
    }),
  ]);

  return {
    totalEvents,
    completedEvents,
    publishedEvents,
    totalVolunteers,
    totalRsvps,
    totalHours: totalHours._sum.hours || 0,
    topVolunteers,
  };
}

export default async function AdminReportsPage() {
  const data = await getReportData();

  return (
    <Container>
      <SectionHeader
        title="Reports"
        description="Overview of community service impact and volunteer activity."
      />

      {/* Summary Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Events" value={data.totalEvents} icon={CalendarDays} />
        <StatsCard title="Completed" value={data.completedEvents} icon={CalendarDays} />
        <StatsCard title="Total Volunteers" value={data.totalVolunteers} icon={Users} />
        <StatsCard
          title="Hours Served"
          value={Math.round(data.totalHours)}
          icon={Clock}
        />
      </div>

      {/* Top Volunteers */}
      {data.topVolunteers.length > 0 && (
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Most Active Volunteers
          </h2>
          <div className="mt-4 space-y-3">
            {data.topVolunteers.map((vol, index) => (
              <div
                key={vol.id}
                className="flex items-center justify-between rounded-lg p-3 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{vol.name}</p>
                    <p className="text-xs text-gray-500">{vol.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary-700">
                    {vol._count.rsvps}
                  </p>
                  <p className="text-xs text-gray-400">events</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Container>
  );
}
