import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatTime } from "@/lib/utils";

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  date: Date | string;
  location: string;
  imageUrl?: string | null;
  maxVolunteers?: number | null;
  rsvpCount: number;
  isExternal?: boolean;
  externalOrganizer?: string | null;
  ministry?: { name: string; color: string | null } | null;
}

export function EventCard({
  id,
  title,
  description,
  date,
  location,
  imageUrl,
  maxVolunteers,
  rsvpCount,
  isExternal,
  externalOrganizer,
  ministry,
}: EventCardProps) {
  const spotsLeft = maxVolunteers ? maxVolunteers - rsvpCount : null;

  return (
    <Link href={`/events/${id}`}>
      <Card className="group h-full transition-shadow hover:shadow-md">
        {imageUrl && (
          <div className="aspect-[16/9] overflow-hidden rounded-t-xl">
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}
        <CardContent className={imageUrl ? "pt-4" : ""}>
          <div className="mb-2 flex flex-wrap gap-1">
            {ministry && (
              <Badge variant="ministry" color={ministry.color || "#4263eb"}>
                {ministry.name}
              </Badge>
            )}
            {isExternal && (
              <Badge variant="warning">
                {externalOrganizer || "Community Event"}
              </Badge>
            )}
          </div>
          <h3 className="text-lg font-semibold text-primary-900 group-hover:text-accent-600">
            {title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">
            {description}
          </p>

          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CalendarDays className="h-4 w-4 text-primary-600" />
              <span>
                {formatDate(date)} at {formatTime(date)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-primary-600" />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4 text-primary-600" />
              <span>
                {rsvpCount} volunteer{rsvpCount !== 1 ? "s" : ""} signed up
                {spotsLeft !== null && (
                  <span className="ml-1 text-gray-400">
                    ({spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left)
                  </span>
                )}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
