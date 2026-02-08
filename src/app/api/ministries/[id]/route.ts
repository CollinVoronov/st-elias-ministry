import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, color } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const ministry = await prisma.ministry.update({
      where: { id: params.id },
      data: {
        name,
        description: description || null,
        color: color || null,
      },
    });

    return NextResponse.json({ data: ministry });
  } catch {
    return NextResponse.json(
      { error: "Failed to update ministry" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eventCount = await prisma.event.count({
      where: { ministryId: params.id },
    });

    if (eventCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete ministry with ${eventCount} linked event(s). Remove events first.` },
        { status: 400 }
      );
    }

    await prisma.ministry.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete ministry" },
      { status: 500 }
    );
  }
}
