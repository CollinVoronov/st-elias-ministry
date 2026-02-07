import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { announcementSchema } from "@/lib/validations";

export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { publishedAt: "desc" },
    });

    return NextResponse.json({ data: announcements });
  } catch {
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = announcementSchema.parse(body);

    const announcement = await prisma.announcement.create({
      data: {
        title: validated.title,
        body: validated.body,
        previewText: validated.previewText || null,
        isPinned: validated.isPinned || false,
        expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : null,
        authorId: session.user.id,
      },
    });

    return NextResponse.json({ data: announcement }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid announcement data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}
