import { CalendarDays, Users, Lightbulb, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { StatsCard } from "@/components/ui/StatsCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getDashboardStats() {
  const now = new Date();
  const [
    upcomingEvents,
    totalVolunteers,
    totalRsvps,
    pendingIdeas,
    recentRsvps,
    nextEvents,
  ] = await Promise.all([
    prisma.event.count({ where: { status: "PUBLISHED", date: { gte: now } } }),
    prisma.volunteer.count(),
    prisma.eventRSVP.count({ where: { status: "CONFIRMED" } }),
    prisma.idea.count({ where: { status: "SUBMITTED" } }),
    prisma.eventRSVP.findMany({
      include: {
        volunteer: { select: { name: true, email: true } },
        event: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.event.findMany({
      where: { status: "PUBLISHED", date: { gte: now } },
      include: { _count: { select: { rsvps: true } } },
      orderBy: { date: "asc" },
      take: 5,
    }),
  ]);

  return { upcomingEvents, totalVolunteers, totalRsvps, pendingIdeas, recentRsvps, nextEvents };
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <Container>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-primary-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Overview of your community service activity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Upcoming Events" value={stats.upcomingEvents} icon={CalendarDays} />
        <StatsCard title="Total Volunteers" value={stats.totalVolunteers} icon={Users} />
        <StatsCard title="Total Sign-ups" value={stats.totalRsvps} icon={Users} />
        <StatsCard
          title="Pending Ideas"
          value={stats.pendingIdeas}
          icon={Lightbulb}
          description={stats.pendingIdeas > 0 ? "Awaiting review" : undefined}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Upcoming Events */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary-900">Upcoming Events</h2>
            <Link href="/admin/events">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          {stats.nextEvents.length > 0 ? (
            <div className="mt-4 space-y-3">
              {stats.nextEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/admin/events/${event.id}`}
                  className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-cream"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{event.title}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <Badge variant="info">{event._count.rsvps} signed up</Badge>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-400">No upcoming events.</p>
          )}
          <div className="mt-4">
            <Link href="/admin/events/new">
              <Button size="sm" className="w-full">Create New Event</Button>
            </Link>
          </div>
        </div>

        {/* Recent Sign-ups */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary-900">Recent Sign-ups</h2>
            <Link href="/admin/volunteers">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          {stats.recentRsvps.length > 0 ? (
            <div className="mt-4 space-y-3">
              {stats.recentRsvps.map((rsvp) => (
                <div key={rsvp.id} className="flex items-center justify-between rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {rsvp.volunteer.name}
                    </p>
                    <p className="text-xs text-gray-600">{rsvp.volunteer.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-700">
                      {rsvp.event.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(rsvp.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-400">No recent sign-ups.</p>
          )}
        </div>
      </div>
    </Container>
  );
}
