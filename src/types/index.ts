import type {
  Event,
  EventRole,
  EventRSVP,
  Volunteer,
  Ministry,
  Announcement,
  Idea,
  IdeaVote,
  Comment,
  ChecklistItem,
  ResourceNeed,
  VolunteerHours,
  EventPhoto,
} from "@prisma/client";

// Event with relations
export type EventWithDetails = Event & {
  organizer: { name: string; email: string };
  ministry: Ministry | null;
  roles: EventRole[];
  rsvps: (EventRSVP & { volunteer: Volunteer; role: EventRole | null })[];
  _count: { rsvps: number };
};

export type EventWithMinistry = Event & {
  ministry: Ministry | null;
  _count: { rsvps: number };
};

// Idea with relations
export type IdeaWithVotes = Idea & {
  votes: IdeaVote[];
  _count: { votes: number; comments: number };
};

// Comment with replies
export type CommentWithReplies = Comment & {
  replies: CommentWithReplies[];
};

// API response wrapper
export type ApiResponse<T> = {
  data?: T;
  error?: string;
};

// Re-export Prisma types for convenience
export type {
  Event,
  EventRole,
  EventRSVP,
  Volunteer,
  Ministry,
  Announcement,
  Idea,
  IdeaVote,
  Comment,
  ChecklistItem,
  ResourceNeed,
  VolunteerHours,
  EventPhoto,
};
