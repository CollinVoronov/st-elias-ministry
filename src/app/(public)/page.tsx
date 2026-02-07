import Link from "next/link";
import { Megaphone, Lightbulb } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { EventsPageContent } from "@/components/events/EventsPageContent";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

// ── Recurring event expansion ──

function expandRecurringEvents<T extends { date: string; isRecurring: boolean; recurrencePattern?: string | null }>(
  events: T[]
): T[] {
  const now = new Date();
  const threeMonthsLater = new Date(now);
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

  const result: T[] = [];

  for (const event of events) {
    result.push(event);

    if (!event.isRecurring || !event.recurrencePattern) continue;

    const baseDate = new Date(event.date);
    let nextDate = new Date(baseDate);

    for (let i = 0; i < 52; i++) {
      switch (event.recurrencePattern) {
        case "weekly":
          nextDate = new Date(nextDate);
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case "biweekly":
          nextDate = new Date(nextDate);
          nextDate.setDate(nextDate.getDate() + 14);
          break;
        case "monthly":
          nextDate = new Date(nextDate);
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case "first-saturday": {
          const current = new Date(nextDate);
          current.setMonth(current.getMonth() + 1);
          current.setDate(1);
          while (current.getDay() !== 6) {
            current.setDate(current.getDate() + 1);
          }
          current.setHours(baseDate.getHours(), baseDate.getMinutes(), 0, 0);
          nextDate = current;
          break;
        }
        default:
          nextDate = new Date(nextDate);
          nextDate.setDate(nextDate.getDate() + 7);
      }

      if (nextDate > threeMonthsLater) break;
      if (nextDate <= now) continue;

      result.push({ ...event, date: nextDate.toISOString() });
    }
  }

  return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// ── Data fetchers ──

async function getAnnouncements() {
  return prisma.announcement.findMany({
    where: {
      isPinned: true,
      status: "PUBLISHED",
      OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });
}

async function getCalendarEvents() {
  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      date: true,
      isExternal: true,
      isRecurring: true,
      recurrencePattern: true,
      ministry: { select: { name: true, color: true } },
    },
    orderBy: { date: "asc" },
  });
  const mapped = events.map((e) => ({
    ...e,
    date: e.date.toISOString(),
  }));
  return expandRecurringEvents(mapped);
}

export default async function HomePage() {
  const [announcements, calendarEvents] = await Promise.all([
    getAnnouncements(),
    getCalendarEvents(),
  ]);

  return (
    <section id="events" className="scroll-mt-16 bg-cream py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-primary-900">
            Events
          </h2>
          <p className="mt-3 text-gray-600">
            Browse our community service events and sign up to volunteer.
          </p>
        </div>

        {/* Announcements inline under events heading */}
        {announcements.length > 0 && (
          <div className={`mt-8 grid gap-4 ${announcements.length === 1 ? "max-w-xl mx-auto" : announcements.length === 2 ? "sm:grid-cols-2 max-w-3xl mx-auto" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
            {announcements.map((a) => (
              <Link
                key={a.id}
                href={`/announcements/${a.id}`}
                className="block rounded-xl border border-accent-200 bg-white p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-accent-600" />
                  <h3 className="font-semibold text-primary-900">{a.title}</h3>
                </div>
                {a.previewText && (
                  <p className="mt-2 text-sm text-gray-600">{a.previewText}</p>
                )}
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">{a.body}</p>
                <p className="mt-3 text-xs text-gray-400">
                  {formatDate(a.publishedAt)}
                </p>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8">
          <EventsPageContent calendarEvents={calendarEvents} />
        </div>

        {/* Share an Idea CTA */}
        <div className="mt-10 rounded-xl border border-accent-200 bg-white p-6 text-center">
          <Lightbulb className="mx-auto h-6 w-6 text-accent-600" />
          <h3 className="mt-2 font-display text-lg font-semibold text-primary-900">
            Have an idea for a community service event?
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Share your ideas and help shape our community outreach.
          </p>
          <Link
            href="/ideas/new"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-800"
          >
            <Lightbulb className="h-4 w-4" />
            Share an Idea
          </Link>
        </div>
      </Container>
    </section>
  );
}
