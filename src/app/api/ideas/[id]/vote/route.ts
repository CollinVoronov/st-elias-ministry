import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if already voted
    const existingVote = await prisma.ideaVote.findUnique({
      where: {
        voterEmail_ideaId: {
          voterEmail: email,
          ideaId: params.id,
        },
      },
    });

    if (existingVote) {
      // Toggle: remove vote
      await prisma.ideaVote.delete({ where: { id: existingVote.id } });
      return NextResponse.json({ data: { voted: false } });
    }

    // Create vote
    await prisma.ideaVote.create({
      data: {
        voterEmail: email,
        ideaId: params.id,
      },
    });

    return NextResponse.json({ data: { voted: true } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}
