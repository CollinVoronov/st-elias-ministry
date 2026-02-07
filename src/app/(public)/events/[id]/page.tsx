import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CalendarDays, MapPin, Users, Clock, Package } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { SignUpForm } from "@/components/events/SignUpForm";
import { formatDate, formatTime } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

async function getEvent(id: string) {
  return prisma.event.findUnique({
    where: { id, status: "PUBLISHED" },
    include: {
      organizer: { select: { name: true } },
      ministry: true,
      roles: {
        include: { _count: { select: { rsvps: true } } },
      },
      rsvps: {
        where: { status: "CONFIRMED" },
        include: { volunteer: { select: { name: true } }, role: true },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { rsvps: true } },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await getEvent(params.id);
  if (!event) return { title: "Event Not Found" };
  return {
    title: event.title,
    description: event.description.slice(0, 160),
  };
}

export default async function EventDetailPage({ params }: Props) {
  const event = await getEvent(params.id);

  if (!event) notFound();

  const spotsLeft = event.maxVolunteers
    ? event.maxVolunteers - event._count.rsvps
    : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;
  const isPast = new Date(event.date) < new Date();

  return (
    <div className="py-12">
      <Container size="lg">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {event.imageUrl && (
              <div className="mb-6 aspect-[16/9] overflow-hidden rounded-xl">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              {event.ministry && (
                <Badge variant="ministry" color={event.ministry.color || "#4263eb"}>
                  {event.ministry.name}
                </Badge>
              )}
              {isFull && <Badge variant="warning">Full</Badge>}
              {isPast && <Badge variant="default">Past Event</Badge>}
            </div>

            <h1 className="mt-3 font-display text-3xl font-bold text-gray-900 sm:text-4xl">
              {event.title}
            </h1>

            {/* Event Details Grid */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
                <CalendarDays className="mt-0.5 h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Date</p>
                  <p className="text-sm text-gray-500">{formatDate(event.date)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
                <Clock className="mt-0.5 h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Time</p>
                  <p className="text-sm text-gray-500">
                    {formatTime(event.date)}
                    {event.endDate && ` - ${formatTime(event.endDate)}`}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
                <MapPin className="mt-0.5 h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Location</p>
                  <p className="text-sm text-gray-500">{event.location}</p>
                  {event.address && (
                    <p className="text-xs text-gray-400">{event.address}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
                <Users className="mt-0.5 h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Volunteers</p>
                  <p className="text-sm text-gray-500">
                    {event._count.rsvps} signed up
                    {spotsLeft !== null && ` (${spotsLeft} spots left)`}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900">About This Event</h2>
              <div className="mt-3 whitespace-pre-wrap text-gray-600">
                {event.description}
              </div>
            </div>

            {/* What to Bring */}
            {event.whatToBring.length > 0 && (
              <div className="mt-8">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Package className="h-5 w-5 text-primary-600" />
                  What to Bring
                </h2>
                <ul className="mt-3 space-y-1">
                  {event.whatToBring.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Volunteers List */}
            {event.rsvps.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900">
                  Volunteers ({event.rsvps.length})
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {event.rsvps.map((rsvp) => (
                    <div
                      key={rsvp.id}
                      className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-200 text-xs font-medium text-primary-800">
                        {rsvp.volunteer.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-700">
                        {rsvp.volunteer.name}
                      </span>
                      {rsvp.role && (
                        <Badge variant="info" className="text-xs">
                          {rsvp.role.name}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Sign Up Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardContent className="py-6">
                  {isPast ? (
                    <div className="text-center">
                      <p className="text-gray-500">This event has already taken place.</p>
                    </div>
                  ) : isFull ? (
                    <div className="text-center">
                      <p className="font-medium text-yellow-700">
                        This event is full.
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Check back later — spots may open up.
                      </p>
                    </div>
                  ) : (
                    <SignUpForm eventId={event.id} roles={event.roles} />
                  )}
                </CardContent>
              </Card>

              {/* Organizer Info */}
              <div className="mt-4 rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Organized by
                </p>
                <p className="mt-1 text-sm font-medium text-gray-700">
                  {event.organizer.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
