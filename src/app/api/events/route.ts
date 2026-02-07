import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { eventSchema } from "@/lib/validations";

export async function GET() {
  try {
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

    return NextResponse.json({ data: events });
  } catch {
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = eventSchema.parse(body);

    const event = await prisma.event.create({
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
        organizerId: session.user.id,
        status: "PUBLISHED",
      },
    });

    return NextResponse.json({ data: event }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid event data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
