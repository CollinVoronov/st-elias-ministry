"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  ministry: { name: string; color: string | null } | null;
}

interface EventCalendarProps {
  events: CalendarEvent[];
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_VISIBLE_PILLS = 3;

export function EventCalendar({ events }: EventCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Group events by date string for O(1) lookup
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const key = format(new Date(event.date), "yyyy-MM-dd");
      const existing = map.get(key) || [];
      existing.push(event);
      map.set(key, existing);
    }
    return map;
  }, [events]);

  // Generate calendar grid days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const gridStart = startOfWeek(monthStart);
    const gridEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [currentMonth]);

  const goToPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDay(new Date());
  };

  const getEventsForDay = (day: Date) => {
    const key = format(day, "yyyy-MM-dd");
    return eventsByDate.get(key) || [];
  };

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div>
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-primary-900">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Today
          </button>
          <button
            onClick={goToPrevMonth}
            className="rounded-lg border border-gray-300 p-1.5 text-gray-600 hover:bg-gray-50"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goToNextMonth}
            className="rounded-lg border border-gray-300 p-1.5 text-gray-600 hover:bg-gray-50"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {DAY_NAMES.map((day) => (
            <div
              key={day}
              className="px-1 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day Cells */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDay(day);
            const inCurrentMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);
            const isSelected = selectedDay && isSameDay(day, selectedDay);
            const overflow = dayEvents.length - MAX_VISIBLE_PILLS;

            return (
              <div
                key={index}
                className={cn(
                  "min-h-[5rem] border-b border-r border-gray-100 p-1 md:min-h-[6.5rem] md:p-2",
                  !inCurrentMonth && "bg-gray-50/50",
                  isSelected && "bg-primary-50",
                  "cursor-pointer hover:bg-gray-50 md:cursor-default md:hover:bg-transparent",
                  isSelected && "md:bg-primary-50"
                )}
                onClick={() => setSelectedDay(day)}
              >
                {/* Day Number */}
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "inline-flex h-7 w-7 items-center justify-center rounded-full text-sm",
                      today &&
                        "bg-primary-700 font-bold text-white",
                      !today && inCurrentMonth && "font-medium text-gray-900",
                      !today && !inCurrentMonth && "text-gray-400"
                    )}
                  >
                    {format(day, "d")}
                  </span>

                  {/* Mobile: dot indicators */}
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 md:hidden">
                      {dayEvents.slice(0, 4).map((event, i) => (
                        <span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            backgroundColor: event.ministry?.color || "#1e3a5f",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Desktop: event pills */}
                <div className="mt-1 hidden space-y-0.5 md:block">
                  {dayEvents.slice(0, MAX_VISIBLE_PILLS).map((event) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="block truncate rounded px-1.5 py-0.5 text-xs font-medium text-white transition-opacity hover:opacity-80"
                      style={{
                        backgroundColor: event.ministry?.color || "#1e3a5f",
                      }}
                    >
                      {event.title}
                    </Link>
                  ))}
                  {overflow > 0 && (
                    <p className="px-1.5 text-xs font-medium text-gray-500">
                      +{overflow} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: Selected Day Panel */}
      {selectedDay && (
        <div className="mt-4 md:hidden">
          <h3 className="font-display text-lg font-semibold text-primary-900">
            {format(selectedDay, "EEEE, MMMM d")}
          </h3>
          {selectedDayEvents.length > 0 ? (
            <div className="mt-2 space-y-2">
              {selectedDayEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-shadow hover:shadow-sm"
                >
                  <span
                    className="h-3 w-3 flex-shrink-0 rounded-full"
                    style={{
                      backgroundColor: event.ministry?.color || "#1e3a5f",
                    }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-primary-900">
                      {event.title}
                    </p>
                    {event.ministry && (
                      <p className="text-xs text-gray-500">
                        {event.ministry.name}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-gray-500">
              No events on this day.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
