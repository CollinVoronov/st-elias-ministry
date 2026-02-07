import Link from "next/link";
import { ArrowRight, Heart, Users, CalendarDays } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { EventCard } from "@/components/events/EventCard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getUpcomingEvents() {
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
    take: 3,
  });
}

async function getAnnouncement() {
  return prisma.announcement.findFirst({
    where: {
      isPinned: true,
      OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
    },
    orderBy: { publishedAt: "desc" },
  });
}

export default async function HomePage() {
  const [events, announcement] = await Promise.all([
    getUpcomingEvents(),
    getAnnouncement(),
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
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/events">
                <Button size="lg" variant="secondary">
                  View Upcoming Events
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="border-primary-400 text-white hover:bg-white/10">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* What We Do Section */}
      <section className="bg-white py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-primary-900">
              How We Serve
            </h2>
            <p className="mt-3 text-gray-600">
              Our community service ministry connects volunteers with meaningful
              opportunities to serve Austin.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-100">
                <CalendarDays className="h-7 w-7 text-primary-700" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-primary-900">
                Find Events
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Browse upcoming service events and sign up to volunteer with just
                your name and email.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-50">
                <Users className="h-7 w-7 text-accent-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-primary-900">
                Join a Team
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Connect with fellow church members and volunteer together
                through our ministry teams.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage-50">
                <Heart className="h-7 w-7 text-sage-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-primary-900">
                Make an Impact
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Track our collective impact and see how our community service
                changes lives.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Upcoming Events */}
      <section className="bg-cream py-20">
        <Container>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold text-primary-900">
                Upcoming Events
              </h2>
              <p className="mt-2 text-gray-600">
                Sign up to volunteer at an upcoming service event.
              </p>
            </div>
            <Link href="/events" className="hidden sm:block">
              <Button variant="outline">
                View All Events
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

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
            <div className="mt-8 rounded-xl border border-gray-200 bg-white py-16 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-semibold text-primary-900">
                No upcoming events yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Check back soon or share an idea for a new service event!
              </p>
              <Link href="/events" className="mt-4 inline-block">
                <Button variant="outline">View All Events</Button>
              </Link>
            </div>
          )}

          <div className="mt-6 text-center sm:hidden">
            <Link href="/events">
              <Button variant="outline">
                View All Events
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-20">
        <Container size="md">
          <div className="rounded-2xl bg-gradient-to-r from-primary-800 to-primary-900 p-12 text-center text-white">
            <h2 className="font-display text-3xl font-bold">
              Ready to Make a Difference?
            </h2>
            <p className="mt-3 text-primary-200">
              Whether you have an hour or a whole day, there&apos;s a way for you to
              serve. Join our community and start making an impact today.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/events">
                <Button size="lg" variant="secondary">
                  Browse Events
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                >
                  Learn More About Us
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
