import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, MapPin, Users, Pencil } from "lucide-react";
import { auth } from "@/lib/auth";
import { DeleteEventButton } from "@/components/events/DeleteEventButton";
import { VolunteerTable } from "@/components/events/VolunteerTable";
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
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isAdmin = session.user.role === "ADMIN";
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
        <div className="flex gap-2">
          {isAdmin && (
            <Link href={`/admin/events/${event.id}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </Link>
          )}
          <Link href={`/events/${event.id}`}>
            <Button variant="outline" size="sm">
              View Public Page
            </Button>
          </Link>
          {isAdmin && <DeleteEventButton eventId={event.id} />}
        </div>
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
          <VolunteerTable
            eventId={event.id}
            rsvps={event.rsvps.map((r) => ({
              id: r.id,
              status: r.status,
              note: r.note,
              createdAt: r.createdAt.toISOString(),
              volunteer: {
                id: r.volunteer.id,
                name: r.volunteer.name,
                email: r.volunteer.email,
                phone: r.volunteer.phone,
              },
              role: r.role ? { id: r.role.id, name: r.role.name } : null,
            }))}
            roles={event.roles.map((r) => ({ id: r.id, name: r.name }))}
            isAdmin={isAdmin}
          />
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
