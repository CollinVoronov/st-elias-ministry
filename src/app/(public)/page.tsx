import { Heart, Users, CalendarDays, Clock, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { StatsCard } from "@/components/ui/StatsCard";
import { EventsPageContent } from "@/components/events/EventsPageContent";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getAnnouncement() {
  return prisma.announcement.findFirst({
    where: {
      isPinned: true,
      OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
    },
    orderBy: { publishedAt: "desc" },
  });
}

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
  return events.map((e) => ({ ...e, date: e.date.toISOString() }));
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

export default async function HomePage() {
  const [announcement, calendarEvents, listEvents, stats] = await Promise.all([
    getAnnouncement(),
    getCalendarEvents(),
    getListEvents(),
    getImpactStats(),
  ]);

  return (
    <>
      {/* Announcement Banner */}
      {announcement && (
        <div className="bg-accent-500 px-4 py-3 text-center text-sm font-medium text-white">
          <strong>{announcement.title}:</strong> {announcement.body}
        </div>
      )}

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-800 via-primary-900 to-primary-900 py-24 text-white">
        <Container size="lg">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Serving Our Community{" "}
              <span className="text-accent-400">Together</span>
            </h1>
            <p className="mt-6 text-lg text-primary-200 sm:text-xl">
              St. Elias Orthodox Church brings people together to make a difference
              in Austin. Join us in serving our neighbors through compassion, love,
              and action.
            </p>
          </div>
        </Container>
      </section>

      {/* Events Section */}
      <section id="events" className="scroll-mt-16 bg-primary-900 py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-white">
              Events
            </h2>
            <p className="mt-3 text-primary-200">
              Browse our community service events and sign up to volunteer.
            </p>
          </div>
          <div className="mt-8">
            <EventsPageContent
              calendarEvents={calendarEvents}
              listEvents={listEvents}
            />
          </div>
        </Container>
      </section>

      {/* How We Serve */}
      <section className="bg-primary-800 py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-white">
              How We Serve
            </h2>
            <p className="mt-3 text-primary-200">
              Our community service ministry connects volunteers with meaningful
              opportunities to serve Austin.
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-700">
                <CalendarDays className="h-7 w-7 text-accent-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">Find Events</h3>
              <p className="mt-2 text-sm text-primary-200">
                Browse upcoming service events and sign up to volunteer with just
                your name and email.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-700">
                <Users className="h-7 w-7 text-accent-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">Join a Team</h3>
              <p className="mt-2 text-sm text-primary-200">
                Connect with fellow church members and volunteer together
                through our ministry teams.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-700">
                <Heart className="h-7 w-7 text-accent-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">Make an Impact</h3>
              <p className="mt-2 text-sm text-primary-200">
                Track our collective impact and see how our community service
                changes lives.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Impact Section */}
      <section id="impact" className="scroll-mt-16 bg-primary-900 py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-white">
              Our Community Impact
            </h2>
            <p className="mt-3 text-primary-200">
              Together, St. Elias church members are making a real difference in Austin.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Events Completed"
              value={stats.eventsCompleted}
              icon={CalendarDays}
              description="Community service events"
              dark
            />
            <StatsCard
              title="Total Volunteers"
              value={stats.totalVolunteers}
              icon={Users}
              description="Unique volunteers"
              dark
            />
            <StatsCard
              title="Hours Served"
              value={Math.round(stats.totalHours)}
              icon={Clock}
              description="Total volunteer hours"
              dark
            />
            <StatsCard
              title="Volunteer Sign-ups"
              value={stats.totalSignUps}
              icon={Heart}
              description="Total event registrations"
              dark
            />
          </div>
        </Container>
      </section>

      {/* About Section */}
      <section id="about" className="scroll-mt-16 bg-primary-800 py-20">
        <Container size="md">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-white">
              About Our Mission
            </h2>
            <p className="mt-3 text-primary-200">
              St. Elias Orthodox Church is committed to serving the Austin community
              through acts of love, compassion, and service.
            </p>
          </div>

          {/* Mission */}
          <div className="mt-12 rounded-2xl bg-primary-700 p-8 sm:p-12">
            <div className="flex items-start gap-4">
              <Heart className="mt-1 h-8 w-8 flex-shrink-0 text-accent-400" />
              <div>
                <h3 className="font-display text-2xl font-bold text-white">
                  Our Mission
                </h3>
                <p className="mt-3 text-primary-200 leading-relaxed">
                  We believe that serving others is at the heart of our faith. Through
                  community service events, volunteer outreach, and collaborative
                  ministry, we strive to make a lasting positive impact on the lives
                  of those around us. Every act of service, no matter how small,
                  reflects God&apos;s love for all people.
                </p>
              </div>
            </div>
          </div>

          {/* Values */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-primary-600 bg-primary-700 p-6">
              <h3 className="text-lg font-semibold text-white">Compassion</h3>
              <p className="mt-2 text-sm text-primary-200">
                We approach every person and every situation with empathy and
                understanding, recognizing the dignity in all people.
              </p>
            </div>
            <div className="rounded-xl border border-primary-600 bg-primary-700 p-6">
              <h3 className="text-lg font-semibold text-white">Community</h3>
              <p className="mt-2 text-sm text-primary-200">
                We work together as one body, pooling our talents, time, and
                resources to achieve more than we could alone.
              </p>
            </div>
            <div className="rounded-xl border border-primary-600 bg-primary-700 p-6">
              <h3 className="text-lg font-semibold text-white">Action</h3>
              <p className="mt-2 text-sm text-primary-200">
                Faith without works is incomplete. We put our beliefs into practice
                through hands-on service to our neighbors.
              </p>
            </div>
            <div className="rounded-xl border border-primary-600 bg-primary-700 p-6">
              <h3 className="text-lg font-semibold text-white">Growth</h3>
              <p className="mt-2 text-sm text-primary-200">
                We continually seek new ways to serve, welcoming fresh ideas and
                expanding our impact year after year.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="mt-12 rounded-2xl border border-primary-600 bg-primary-700 p-8 sm:p-12">
            <h3 className="font-display text-2xl font-bold text-white">
              Get in Touch
            </h3>
            <p className="mt-2 text-primary-200">
              Want to learn more about our community service ministry? We&apos;d love to
              hear from you.
            </p>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:gap-8">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-accent-400" />
                <div>
                  <p className="text-sm font-medium text-white">Address</p>
                  <p className="text-sm text-primary-200">
                    408 East 11th Street, Austin, TX 78701
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-accent-400" />
                <div>
                  <p className="text-sm font-medium text-white">Phone</p>
                  <a
                    href="tel:+15124762314"
                    className="text-sm text-primary-200 hover:text-accent-400"
                  >
                    (512) 476-2314
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
