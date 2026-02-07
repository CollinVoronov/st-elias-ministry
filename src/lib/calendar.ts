interface CalendarEvent {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date | null;
  location: string;
  address?: string | null;
}

function formatDateToICS(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export function generateICS(event: CalendarEvent): string {
  const now = new Date();
  const uid = `${now.getTime()}-${Math.random().toString(36).substring(2, 9)}@sainteliaschurch.org`;

  const startDT = formatDateToICS(event.startDate);
  const endDate =
    event.endDate ?? new Date(event.startDate.getTime() + 2 * 60 * 60 * 1000);
  const endDT = formatDateToICS(endDate);
  const createdDT = formatDateToICS(now);

  const locationParts = [event.location];
  if (event.address) locationParts.push(event.address);
  const fullLocation = locationParts.join(", ");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//St Elias Orthodox Church//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${createdDT}`,
    `DTSTART:${startDT}`,
    `DTEND:${endDT}`,
    `SUMMARY:${escapeICSText(event.title)}`,
    `DESCRIPTION:${escapeICSText(event.description)}`,
    `LOCATION:${escapeICSText(fullLocation)}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n");
}
