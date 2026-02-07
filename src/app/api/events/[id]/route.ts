import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { eventSchema } from "@/lib/validations";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
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
        checklist: { orderBy: { order: "asc" } },
        resources: true,
        _count: { select: { rsvps: true } },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ data: event });
  } catch {
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = eventSchema.parse(body);

    const event = await prisma.event.update({
      where: { id: params.id },
      data: {
        title: validated.title,
        description: validated.description,
        date: new Date(validated.date),
        endDate: validated.endDate ? new Date(validated.endDate) : null,
        location: validated.location,
        address: validated.address || null,
        maxVolunteers: validated.maxVolunteers || null,
        whatToBring: validated.whatToBring || [],
        ministryId: validated.ministryId || null,
        imageUrl: validated.imageUrl || null,
        isExternal: validated.isExternal || false,
        isRecurring: validated.isRecurring || false,
        recurrencePattern: validated.recurrencePattern || null,
        externalOrganizer: validated.externalOrganizer || null,
      },
    });

    return NextResponse.json({ data: event });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid event data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.event.delete({ where: { id: params.id } });
    return NextResponse.json({ data: { success: true } });
  } catch {
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
