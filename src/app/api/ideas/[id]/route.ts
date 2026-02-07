import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idea = await prisma.idea.findUnique({
      where: { id: params.id },
      include: {
        _count: { select: { votes: true, comments: true } },
        comments: {
          where: { parentId: null },
          orderBy: { createdAt: "desc" },
          include: { replies: { orderBy: { createdAt: "asc" } } },
        },
      },
    });

    if (!idea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    return NextResponse.json({ data: idea });
  } catch {
    return NextResponse.json({ error: "Failed to fetch idea" }, { status: 500 });
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

    const { status } = await request.json();

    const validStatuses = ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "IN_PLANNING", "DECLINED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const idea = await prisma.idea.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json({ data: idea });
  } catch {
    return NextResponse.json({ error: "Failed to update idea" }, { status: 500 });
  }
}
