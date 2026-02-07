import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { eventSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const proposals = await prisma.event.findMany({
      where: {
        organizerId: session.user.id,
        isExternal: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: proposals });
  } catch {
    return NextResponse.json({ error: "Failed to fetch proposals" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "COMMUNITY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = eventSchema.parse(body);

    const proposal = await prisma.event.create({
      data: {
        title: validated.title,
        description: validated.description || "",
        date: new Date(validated.date),
        endDate: validated.endDate ? new Date(validated.endDate) : null,
        location: validated.location,
        address: validated.address || null,
        maxVolunteers: validated.maxVolunteers || null,
        whatToBring: validated.whatToBring || [],
        isExternal: true,
        externalOrganizer: session.user.organization || null,
        organizerId: session.user.id,
        status: "DRAFT",
      },
    });

    return NextResponse.json({ data: proposal }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid proposal data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create proposal" }, { status: 500 });
  }
}
