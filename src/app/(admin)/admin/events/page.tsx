import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Plus, Calendar } from "lucide-react";
import { auth } from "@/lib/auth";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { EventsFilterBar } from "@/components/events/EventsFilterBar";
import { AdminIdeasSection } from "@/components/events/AdminIdeasSection";

export const dynamic = "force-dynamic";

const statusVariant: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  DRAFT: "default",
  PUBLISHED: "success",
  CANCELLED: "danger",
  COMPLETED: "info",
};

interface Props {
  searchParams: { ministry?: string };
}

async function getAllEvents(ministryId?: string) {
  return prisma.event.findMany({
    where: ministryId ? { ministryId } : {},
    include: {
      ministry: true,
      organizer: { select: { name: true } },
      _count: { select: { rsvps: true } },
    },
    orderBy: { date: "desc" },
  });
}

async function getAllMinistries() {
  return prisma.ministry.findMany({ orderBy: { name: "asc" } });
}

async function getAllIdeas() {
  return prisma.idea.findMany({
    include: { _count: { select: { votes: true, comments: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminEventsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isAdmin = session.user.role === "ADMIN";

  const [events, ministries, ideas] = await Promise.all([
    getAllEvents(searchParams.ministry || undefined),
    getAllMinistries(),
    isAdmin ? getAllIdeas() : Promise.resolve([]),
  ]);

  const serializedIdeas = ideas.map((idea) => ({
    id: idea.id,
    title: idea.title,
    description: idea.description,
    submitterName: idea.submitterName,
    status: idea.status,
    createdAt: idea.createdAt.toISOString(),
    _count: idea._count,
  }));

  return (
    <Container>
      <SectionHeader
        title={isAdmin ? "Events & Opportunities" : "Calendar"}
        description={isAdmin
          ? "Create, edit, and manage community service events and external opportunities."
          : "View published community service events and external opportunities."
        }
        action={
          isAdmin ? (
            <Link href="/admin/events/new">
              <Button>
                <Plus className="h-4 w-4" />
                New Event
              </Button>
            </Link>
          ) : undefined
        }
      />

      <div className="mt-4">
        <Suspense>
          <EventsFilterBar ministries={ministries} />
        </Suspense>
      </div>

      {events.length > 0 ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full">
            <thead className="bg-cream">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Event
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Volunteers
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Ministry
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-cream">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="font-medium text-gray-900 hover:text-primary-700"
                    >
                      {event.title}
                    </Link>
                    <p className="text-xs text-gray-600">{event.location}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(event.date)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[event.status]}>
                      {event.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {event.isExternal && (
                        <Badge variant="warning">External</Badge>
                      )}
                      {event.isRecurring && (
                        <Badge variant="info">Recurring</Badge>
                      )}
                      {!event.isExternal && !event.isRecurring && (
                        <span className="text-sm text-gray-400">Church</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {event._count.rsvps}
                    {event.maxVolunteers && ` / ${event.maxVolunteers}`}
                  </td>
                  <td className="px-4 py-3">
                    {event.ministry ? (
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-3 w-3 rounded-full"
                          style={{ backgroundColor: event.ministry.color || "#6b7280" }}
                        />
                        <span className="text-sm text-gray-600">
                          {event.ministry.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
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
            title="No events found"
            description={isAdmin
              ? "No events match your current filter. Try removing the filter or create a new event."
              : "No events match your current filter."
            }
            action={
              isAdmin ? (
                <Link href="/admin/events/new">
                  <Button>
                    <Plus className="h-4 w-4" />
                    Create Event
                  </Button>
                </Link>
              ) : undefined
            }
          />
        </div>
      )}

      {/* Ideas Section — Admin only */}
      {isAdmin && <AdminIdeasSection initialIdeas={serializedIdeas} />}
    </Container>
  );
}
