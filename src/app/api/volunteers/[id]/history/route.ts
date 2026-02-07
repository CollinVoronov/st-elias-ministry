import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const volunteerId = params.id;

    const volunteer = await prisma.volunteer.findUnique({
      where: { id: volunteerId },
    });

    if (!volunteer) {
      return NextResponse.json({ error: "Volunteer not found" }, { status: 404 });
    }

    const rsvps = await prisma.eventRSVP.findMany({
      where: { volunteerId },
      include: {
        event: { select: { title: true, date: true } },
        role: { select: { name: true } },
      },
      orderBy: { event: { date: "desc" } },
    });

    const data = rsvps.map((rsvp) => ({
      id: rsvp.id,
      eventTitle: rsvp.event.title,
      eventDate: rsvp.event.date.toISOString(),
      roleName: rsvp.role?.name ?? null,
      status: rsvp.status,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Volunteer history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch volunteer history" },
      { status: 500 }
    );
  }
}
