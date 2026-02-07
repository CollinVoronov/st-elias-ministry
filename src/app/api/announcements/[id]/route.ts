import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { announcementSchema } from "@/lib/validations";

const updateSchema = announcementSchema.partial();

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
    const validated = updateSchema.parse(body);

    // Only ADMIN can change status to PUBLISHED
    if (body.status === "PUBLISHED" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can approve announcements" },
        { status: 403 }
      );
    }

    const data: Record<string, unknown> = {};
    if (validated.title !== undefined) data.title = validated.title;
    if (validated.body !== undefined) data.body = validated.body;
    if (validated.previewText !== undefined) data.previewText = validated.previewText || null;
    if (validated.isPinned !== undefined) data.isPinned = validated.isPinned;
    if (validated.expiresAt !== undefined) data.expiresAt = validated.expiresAt ? new Date(validated.expiresAt) : null;
    if (body.status !== undefined) data.status = body.status;

    const announcement = await prisma.announcement.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ data: announcement });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid announcement data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update announcement" }, { status: 500 });
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

    await prisma.announcement.delete({ where: { id: params.id } });
    return NextResponse.json({ data: { success: true } });
  } catch {
    return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 });
  }
}
