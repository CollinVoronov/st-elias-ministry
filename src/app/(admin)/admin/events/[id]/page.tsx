import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, CalendarDays, MapPin, Users } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { StatsCard } from "@/components/ui/StatsCard";
import { formatDate, formatTime } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

async function getEvent(id: string) {
  return prisma.event.findUnique({
    where: { id },
    include: {
      organizer: { select: { name: true, email: true } },
      ministry: true,
      roles: { include: { _count: { select: { rsvps: true } } } },
      rsvps: {
        include: {
          volunteer: true,
          role: true,
        },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { rsvps: true } },
    },
  });
}

const statusVariant: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  DRAFT: "default",
  PUBLISHED: "success",
  CANCELLED: "danger",
  COMPLETED: "info",
};

export default async function AdminEventDetailPage({ params }: Props) {
  const event = await getEvent(params.id);

  if (!event) notFound();

  return (
    <Container>
      <Link
        href="/admin/events"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Events
      </Link>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-primary-900">
              {event.title}
            </h1>
            <Badge variant={statusVariant[event.status]}>{event.status}</Badge>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Organized by {event.organizer.name}
          </p>
        </div>
        <Link href={`/events/${event.id}`}>
          <Button variant="outline" size="sm">
            View Public Page
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatsCard
          title="Volunteers"
          value={event._count.rsvps}
          icon={Users}
          description={event.maxVolunteers ? `of ${event.maxVolunteers} max` : "No limit set"}
        />
        <StatsCard
          title="Date"
          value={formatDate(event.date)}
          icon={CalendarDays}
          description={`${formatTime(event.date)}${event.endDate ? ` - ${formatTime(event.endDate)}` : ""}`}
        />
        <StatsCard title="Location" value={event.location} icon={MapPin} />
      </div>

      {/* Volunteer List */}
      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary-900">
              Volunteers ({event.rsvps.length})
            </h2>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {event.rsvps.length > 0 ? (
            <table className="w-full">
              <thead className="bg-cream">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                    Signed Up
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {event.rsvps.map((rsvp) => (
                  <tr key={rsvp.id} className="hover:bg-cream">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {rsvp.volunteer.name}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`mailto:${rsvp.volunteer.email}`}
                        className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800"
                      >
                        <Mail className="h-3 w-3" />
                        {rsvp.volunteer.email}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      {rsvp.volunteer.phone ? (
                        <a
                          href={`tel:${rsvp.volunteer.phone}`}
                          className="flex items-center gap-1 text-sm text-gray-600"
                        >
                          <Phone className="h-3 w-3" />
                          {rsvp.volunteer.phone}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {rsvp.role?.name || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={rsvp.status === "CONFIRMED" ? "success" : "default"}>
                        {rsvp.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {new Date(rsvp.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-8 text-center text-sm text-gray-400">
              No volunteers signed up yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Description */}
      <Card className="mt-6">
        <CardHeader>
          <h2 className="text-lg font-semibold text-primary-900">Description</h2>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-sm text-gray-600">
            {event.description}
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
