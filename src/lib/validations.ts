import { z } from "zod";

export const volunteerSignUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  roleId: z.string().optional(),
  note: z.string().optional(),
});

export type VolunteerSignUpInput = z.infer<typeof volunteerSignUpSchema>;

export const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  date: z.string().min(1, "Date is required"),
  endDate: z.string().optional(),
  location: z.string().min(2, "Location is required"),
  address: z.string().optional(),
  maxVolunteers: z.number().min(1).optional(),
  whatToBring: z.array(z.string()).optional(),
  ministryId: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  isExternal: z.boolean().optional(),
  isRecurring: z.boolean().optional(),
  recurrencePattern: z.string().optional(),
  externalOrganizer: z.string().optional(),
});

export type EventInput = z.infer<typeof eventSchema>;

export const ideaSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  submitterName: z.string().min(2, "Name is required"),
  submitterEmail: z.string().email("Please enter a valid email"),
});

export type IdeaInput = z.infer<typeof ideaSchema>;

export const announcementSchema = z.object({
  title: z.string().min(3, "Subject must be at least 3 characters"),
  body: z.string().min(10, "Message must be at least 10 characters"),
  previewText: z.string().optional(),
  isPinned: z.boolean().optional(),
  expiresAt: z.string().optional(),
});

export type AnnouncementInput = z.infer<typeof announcementSchema>;
