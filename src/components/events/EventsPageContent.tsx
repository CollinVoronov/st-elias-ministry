"use client";

import { useState } from "react";
import { CalendarDays, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { EventCalendar } from "@/components/events/EventCalendar";
import { EventCard } from "@/components/events/EventCard";
import { EmptyState } from "@/components/ui/EmptyState";

interface CalendarEventData {
  id: string;
  title: string;
  date: string;
  ministry: { name: string; color: string | null } | null;
}

interface ListEventData {
  id: string;
  title: string;
  description: string;
  date: Date | string;
  location: string;
  imageUrl: string | null;
  maxVolunteers: number | null;
  rsvpCount: number;
  ministry: { name: string; color: string | null } | null;
}

interface EventsPageContentProps {
  calendarEvents: CalendarEventData[];
  listEvents: ListEventData[];
}

export function EventsPageContent({
  calendarEvents,
  listEvents,
}: EventsPageContentProps) {
  const [view, setView] = useState<"calendar" | "list">("calendar");

  return (
    <div>
      {/* View Toggle */}
      <div className="mt-6 flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 w-fit">
        <button
          onClick={() => setView("calendar")}
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            view === "calendar"
              ? "bg-primary-700 text-white"
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          <CalendarDays className="h-4 w-4" />
          Calendar
        </button>
        <button
          onClick={() => setView("list")}
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            view === "list"
              ? "bg-primary-700 text-white"
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          <LayoutGrid className="h-4 w-4" />
          List
        </button>
      </div>

      {/* Content */}
      <div className="mt-6">
        {view === "calendar" ? (
          <EventCalendar events={calendarEvents} />
        ) : listEvents.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listEvents.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                description={event.description}
                date={event.date}
                location={event.location}
                imageUrl={event.imageUrl}
                maxVolunteers={event.maxVolunteers}
                rsvpCount={event.rsvpCount}
                ministry={event.ministry}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CalendarDays}
            title="No upcoming events"
            description="There are no upcoming events right now. Check back soon!"
          />
        )}
      </div>
    </div>
  );
}
