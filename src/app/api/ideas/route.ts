import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ideaSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ideas = await prisma.idea.findMany({
      where: { status: { not: "DECLINED" } },
      include: {
        _count: { select: { votes: true, comments: true } },
      },
      orderBy: [{ votes: { _count: "desc" } }, { createdAt: "desc" }],
    });

    return NextResponse.json({ data: ideas });
  } catch {
    return NextResponse.json({ error: "Failed to fetch ideas" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = ideaSchema.parse(body);

    const idea = await prisma.idea.create({
      data: {
        title: validated.title,
        description: validated.description || "",
        submitterName: validated.submitterName,
        submitterEmail: validated.submitterEmail,
      },
    });

    return NextResponse.json({ data: idea }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid idea data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to submit idea" }, { status: 500 });
  }
}
