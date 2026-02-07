import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NewEventForm } from "@/components/events/NewEventForm";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

async function getEvent(id: string) {
  return prisma.event.findUnique({
    where: { id },
    include: { ministry: true },
  });
}

export default async function EditEventPage({ params }: Props) {
  const event = await getEvent(params.id);
  if (!event) notFound();

  return (
    <NewEventForm
      event={{
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date.toISOString().slice(0, 16),
        endDate: event.endDate ? event.endDate.toISOString().slice(0, 16) : undefined,
        location: event.location,
        address: event.address || undefined,
        maxVolunteers: event.maxVolunteers || undefined,
        whatToBring: event.whatToBring,
        ministryId: event.ministryId || undefined,
        imageUrl: event.imageUrl || undefined,
        isExternal: event.isExternal,
        isRecurring: event.isRecurring,
        recurrencePattern: event.recurrencePattern || undefined,
        externalOrganizer: event.externalOrganizer || undefined,
      }}
    />
  );
}
