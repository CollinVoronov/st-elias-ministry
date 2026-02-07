import { Resend } from "resend";

interface SendRSVPConfirmationParams {
  to: string;
  volunteerName: string;
  eventTitle: string;
  eventDescription: string;
  eventDate: Date;
  eventEndDate: Date | null;
  eventLocation: string;
  eventAddress: string | null;
  whatToBring: string[];
  icsContent: string;
}

export async function sendRSVPConfirmation({
  to,
  volunteerName,
  eventTitle,
  eventDescription,
  eventDate,
  eventEndDate,
  eventLocation,
  eventAddress,
  whatToBring,
  icsContent,
}: SendRSVPConfirmationParams): Promise<void> {
  const dateStr = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const timeStr = eventDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const endTimeStr = eventEndDate
    ? eventEndDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : null;

  const timeRange = endTimeStr ? `${timeStr} - ${endTimeStr}` : timeStr;

  const whatToBringSection =
    whatToBring.length > 0
      ? `\n\nWhat to Bring:\n${whatToBring.map((item) => `  - ${item}`).join("\n")}`
      : "";

  const addressLine = eventAddress ? `\n${eventAddress}` : "";

  const textBody = `Hi ${volunteerName},

You're signed up for "${eventTitle}"!

Date: ${dateStr}
Time: ${timeRange}
Location: ${eventLocation}${addressLine}${whatToBringSection}

${eventDescription}

A calendar invite is attached -- open the .ics file to add this event to your calendar.

Thank you for volunteering!
St. Elias Orthodox Church`;

  const htmlBody = `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #1a365d;">You're signed up!</h2>
  <p>Hi ${volunteerName},</p>
  <p>You're confirmed for <strong>${eventTitle}</strong>.</p>

  <div style="background-color: #f7f7f7; padding: 16px; border-radius: 8px; margin: 16px 0;">
    <p style="margin: 4px 0;"><strong>Date:</strong> ${dateStr}</p>
    <p style="margin: 4px 0;"><strong>Time:</strong> ${timeRange}</p>
    <p style="margin: 4px 0;"><strong>Location:</strong> ${eventLocation}${eventAddress ? `<br/><span style="color: #666;">${eventAddress}</span>` : ""}</p>
  </div>

  ${
    whatToBring.length > 0
      ? `<div style="margin: 16px 0;">
          <p><strong>What to Bring:</strong></p>
          <ul>${whatToBring.map((item) => `<li>${item}</li>`).join("")}</ul>
        </div>`
      : ""
  }

  <p style="color: #666; font-size: 14px;">${eventDescription}</p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
  <p style="color: #999; font-size: 12px;">
    A calendar invite (.ics) is attached to this email. Open it to add the event to your calendar.
  </p>
  <p style="color: #999; font-size: 12px;">St. Elias Orthodox Church, Austin, TX</p>
</div>`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@sainteliaschurch.org";

  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: `You're signed up: ${eventTitle}`,
    text: textBody,
    html: htmlBody,
    attachments: [
      {
        filename: "event.ics",
        content: Buffer.from(icsContent).toString("base64"),
      },
    ],
  });
}
