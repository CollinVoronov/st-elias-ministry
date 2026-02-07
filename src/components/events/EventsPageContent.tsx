"use client";

import { useState } from "react";
import { Building2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { EventCalendar } from "@/components/events/EventCalendar";

interface CalendarEventData {
  id: string;
  title: string;
  date: string;
  isExternal: boolean;
  ministry: { name: string; color: string | null } | null;
}

interface EventsPageContentProps {
  calendarEvents: CalendarEventData[];
}

export function EventsPageContent({
  calendarEvents,
}: EventsPageContentProps) {
  const [tab, setTab] = useState<"our-events" | "community">("our-events");

  const filteredCalendarEvents = calendarEvents.filter((e) =>
    tab === "our-events" ? !e.isExternal : e.isExternal
  );

  return (
    <div>
      {/* Event Type Tabs */}
      <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 w-fit">
        <button
          onClick={() => setTab("our-events")}
          className={cn(
            "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            tab === "our-events"
              ? "bg-primary-700 text-white"
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          <Building2 className="h-4 w-4" />
          Our Events
        </button>
        <button
          onClick={() => setTab("community")}
          className={cn(
            "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            tab === "community"
              ? "bg-primary-700 text-white"
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          <Globe className="h-4 w-4" />
          Community Opportunities
        </button>
      </div>

      {/* Calendar */}
      <div className="mt-6">
        <EventCalendar events={filteredCalendarEvents} />
      </div>
    </div>
  );
}
