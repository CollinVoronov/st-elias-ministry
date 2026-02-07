import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EventCard } from "@/components/events/EventCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Upcoming Events",
  description: "Browse and sign up for community service events at St. Elias Orthodox Church.",
};

async function getEvents() {
  return prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      date: { gte: new Date() },
    },
    include: {
      ministry: true,
      _count: { select: { rsvps: true } },
    },
    orderBy: { date: "asc" },
  });
}

async function getMinistries() {
  return prisma.ministry.findMany({
    orderBy: { name: "asc" },
  });
}

export default async function EventsPage() {
  const [events, ministries] = await Promise.all([
    getEvents(),
    getMinistries(),
  ]);

  return (
    <div className="py-12">
      <Container>
        <SectionHeader
          title="Upcoming Events"
          description="Browse our upcoming community service events and sign up to volunteer."
        />

        {/* Ministry Filter Tags */}
        {ministries.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700">
              All Events
            </span>
            {ministries.map((ministry) => (
              <span
                key={ministry.id}
                className="rounded-full px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100"
                style={
                  ministry.color
                    ? { backgroundColor: `${ministry.color}15`, color: ministry.color }
                    : undefined
                }
              >
                {ministry.name}
              </span>
            ))}
          </div>
        )}

        {events.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                description={event.description}
                date={event.date}
                location={event.location}
                imageUrl={event.imageUrl}
                maxVolunteers={event.maxVolunteers}
                rsvpCount={event._count.rsvps}
                ministry={event.ministry}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState
              icon={CalendarDays}
              title="No upcoming events"
              description="There are no upcoming events right now. Check back soon or share an idea for a new community service event!"
            />
          </div>
        )}
      </Container>
    </div>
  );
}
