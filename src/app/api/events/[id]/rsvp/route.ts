import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { volunteerSignUpSchema } from "@/lib/validations";
import { generateICS } from "@/lib/calendar";
import { sendRSVPConfirmation } from "@/lib/email";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validated = volunteerSignUpSchema.parse(body);

    // Check event exists and is published
    const event = await prisma.event.findUnique({
      where: { id: params.id, status: "PUBLISHED" },
      include: { _count: { select: { rsvps: true } } },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if event is in the past
    if (new Date(event.date) < new Date()) {
      return NextResponse.json({ error: "This event has already taken place" }, { status: 400 });
    }

    // Check capacity
    if (event.maxVolunteers && event._count.rsvps >= event.maxVolunteers) {
      return NextResponse.json({ error: "This event is full" }, { status: 400 });
    }

    // Find or create volunteer
    let volunteer = await prisma.volunteer.findFirst({
      where: { email: validated.email },
    });

    if (!volunteer) {
      volunteer = await prisma.volunteer.create({
        data: {
          name: validated.name,
          email: validated.email,
          phone: validated.phone || null,
        },
      });
    } else {
      // Update name/phone if they changed
      volunteer = await prisma.volunteer.update({
        where: { id: volunteer.id },
        data: {
          name: validated.name,
          phone: validated.phone || volunteer.phone,
        },
      });
    }

    // Check if already signed up
    const existingRsvp = await prisma.eventRSVP.findUnique({
      where: {
        volunteerId_eventId: {
          volunteerId: volunteer.id,
          eventId: params.id,
        },
      },
    });

    if (existingRsvp) {
      return NextResponse.json(
        { error: "You are already signed up for this event" },
        { status: 400 }
      );
    }

    // Create RSVP
    const rsvp = await prisma.eventRSVP.create({
      data: {
        volunteerId: volunteer.id,
        eventId: params.id,
        roleId: validated.roleId || null,
        note: validated.note || null,
        status: "CONFIRMED",
      },
      include: {
        volunteer: true,
        event: { select: { title: true } },
      },
    });

    // Fire-and-forget: send confirmation email with calendar invite
    try {
      const icsContent = generateICS({
        title: event.title,
        description: event.description,
        startDate: new Date(event.date),
        endDate: event.endDate ? new Date(event.endDate) : null,
        location: event.location,
        address: event.address,
      });

      sendRSVPConfirmation({
        to: validated.email,
        volunteerName: validated.name,
        eventTitle: event.title,
        eventDescription: event.description,
        eventDate: new Date(event.date),
        eventEndDate: event.endDate ? new Date(event.endDate) : null,
        eventLocation: event.location,
        eventAddress: event.address,
        whatToBring: event.whatToBring,
        icsContent,
      }).catch((emailError) => {
        console.error("Failed to send RSVP confirmation email:", emailError);
      });
    } catch (emailError) {
      console.error("Failed to generate calendar invite:", emailError);
    }

    return NextResponse.json({ data: rsvp }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid sign-up data" }, { status: 400 });
    }
    console.error("RSVP error:", error);
    return NextResponse.json({ error: "Failed to sign up" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const volunteer = await prisma.volunteer.findFirst({
      where: { email },
    });

    if (!volunteer) {
      return NextResponse.json({ error: "Volunteer not found" }, { status: 404 });
    }

    await prisma.eventRSVP.delete({
      where: {
        volunteerId_eventId: {
          volunteerId: volunteer.id,
          eventId: params.id,
        },
      },
    });

    return NextResponse.json({ data: { success: true } });
  } catch {
    return NextResponse.json({ error: "Failed to cancel sign-up" }, { status: 500 });
  }
}
