import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const ministries = await prisma.ministry.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ data: ministries });
  } catch {
    return NextResponse.json({ error: "Failed to fetch ministries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, color } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const ministry = await prisma.ministry.create({
      data: { name, description: description || null, color: color || null },
    });

    return NextResponse.json({ data: ministry }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create ministry" }, { status: 500 });
  }
}
