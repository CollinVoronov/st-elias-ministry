import type { Metadata } from "next";
import { Heart, Users, CalendarDays, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { StatsCard } from "@/components/ui/StatsCard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Impact",
  description: "See the collective impact of St. Elias Orthodox Church community service.",
};

async function getImpactStats() {
  const [eventCount, volunteerCount, totalHours, rsvpCount] = await Promise.all([
    prisma.event.count({ where: { status: "COMPLETED" } }),
    prisma.volunteer.count(),
    prisma.volunteerHours.aggregate({ _sum: { hours: true } }),
    prisma.eventRSVP.count({ where: { status: "CONFIRMED" } }),
  ]);

  return {
    eventsCompleted: eventCount,
    totalVolunteers: volunteerCount,
    totalHours: totalHours._sum.hours || 0,
    totalSignUps: rsvpCount,
  };
}

async function getRecentCompletedEvents() {
  return prisma.event.findMany({
    where: { status: "COMPLETED" },
    include: {
      ministry: true,
      _count: { select: { rsvps: true } },
    },
    orderBy: { date: "desc" },
    take: 6,
  });
}

export default async function ImpactPage() {
  const [stats, recentEvents] = await Promise.all([
    getImpactStats(),
    getRecentCompletedEvents(),
  ]);

  return (
    <div className="py-12">
      <Container>
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-4xl font-bold text-gray-900">
            Our Community Impact
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Together, St. Elias church members are making a real difference in Austin.
            Here&apos;s a look at what we&apos;ve accomplished.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Events Completed"
            value={stats.eventsCompleted}
            icon={CalendarDays}
            description="Community service events"
          />
          <StatsCard
            title="Total Volunteers"
            value={stats.totalVolunteers}
            icon={Users}
            description="Unique volunteers"
          />
          <StatsCard
            title="Hours Served"
            value={Math.round(stats.totalHours)}
            icon={Clock}
            description="Total volunteer hours"
          />
          <StatsCard
            title="Volunteer Sign-ups"
            value={stats.totalSignUps}
            icon={Heart}
            description="Total event registrations"
          />
        </div>

        {/* Recent Completed Events */}
        {recentEvents.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl font-bold text-gray-900">
              Recent Events
            </h2>
            <p className="mt-2 text-gray-500">
              Our most recently completed community service events.
            </p>
            <div className="mt-6 space-y-4">
              {recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                      {event.ministry && (
                        <span
                          className="ml-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                          style={
                            event.ministry.color
                              ? {
                                  backgroundColor: `${event.ministry.color}20`,
                                  color: event.ministry.color,
                                }
                              : undefined
                          }
                        >
                          {event.ministry.name}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-700">
                      {event._count.rsvps}
                    </p>
                    <p className="text-xs text-gray-400">volunteers</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
