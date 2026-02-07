import Link from "next/link";
import { Plus, Calendar } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusVariant: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  DRAFT: "default",
  PUBLISHED: "success",
  CANCELLED: "danger",
  COMPLETED: "info",
};

async function getAllEvents() {
  return prisma.event.findMany({
    include: {
      ministry: true,
      organizer: { select: { name: true } },
      _count: { select: { rsvps: true } },
    },
    orderBy: { date: "desc" },
  });
}

export default async function AdminEventsPage() {
  const events = await getAllEvents();

  return (
    <Container>
      <SectionHeader
        title="Manage Events"
        description="Create, edit, and manage community service events."
        action={
          <Link href="/admin/events/new">
            <Button>
              <Plus className="h-4 w-4" />
              New Event
            </Button>
          </Link>
        }
      />

      {events.length > 0 ? (
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Event
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Volunteers
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Ministry
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="font-medium text-gray-900 hover:text-primary-700"
                    >
                      {event.title}
                    </Link>
                    <p className="text-xs text-gray-500">{event.location}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(event.date)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[event.status]}>
                      {event.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {event._count.rsvps}
                    {event.maxVolunteers && ` / ${event.maxVolunteers}`}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {event.ministry?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/events/${event.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            icon={Calendar}
            title="No events yet"
            description="Create your first community service event."
            action={
              <Link href="/admin/events/new">
                <Button>
                  <Plus className="h-4 w-4" />
                  Create Event
                </Button>
              </Link>
            }
          />
        </div>
      )}
    </Container>
  );
}
