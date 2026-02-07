import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EventsPageContent } from "@/components/events/EventsPageContent";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events",
  description: "Browse and sign up for community service events at St. Elias Orthodox Church.",
};

async function getCalendarEvents() {
  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      date: true,
      ministry: { select: { name: true, color: true } },
    },
    orderBy: { date: "asc" },
  });

  return events.map((e) => ({
    ...e,
    date: e.date.toISOString(),
  }));
}

async function getListEvents() {
  const events = await prisma.event.findMany({
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

  return events.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    date: e.date.toISOString(),
    location: e.location,
    imageUrl: e.imageUrl,
    maxVolunteers: e.maxVolunteers,
    rsvpCount: e._count.rsvps,
    ministry: e.ministry ? { name: e.ministry.name, color: e.ministry.color } : null,
  }));
}

export default async function EventsPage() {
  const [calendarEvents, listEvents] = await Promise.all([
    getCalendarEvents(),
    getListEvents(),
  ]);

  return (
    <div className="py-12">
      <Container>
        <SectionHeader
          title="Events"
          description="Browse our community service events and sign up to volunteer."
        />
        <EventsPageContent
          calendarEvents={calendarEvents}
          listEvents={listEvents}
        />
      </Container>
    </div>
  );
}
