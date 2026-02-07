"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { eventSchema, type EventInput } from "@/lib/validations";

interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  address?: string;
  maxVolunteers?: number;
  whatToBring?: string[];
  ministryId?: string;
  imageUrl?: string;
  isExternal?: boolean;
  isRecurring?: boolean;
  recurrencePattern?: string;
  externalOrganizer?: string;
}

interface NewEventFormProps {
  defaultTitle?: string;
  defaultDescription?: string;
  ideaId?: string;
  event?: EventData;
}

export function NewEventForm({ defaultTitle, defaultDescription, ideaId, event }: NewEventFormProps) {
  const router = useRouter();
  const isEditing = !!event;
  const [serverError, setServerError] = useState("");
  const [ministries, setMinistries] = useState<{ id: string; name: string }[]>([]);
  const [showNewMinistry, setShowNewMinistry] = useState(false);
  const [newMinistryName, setNewMinistryName] = useState("");
  const [creatingMinistry, setCreatingMinistry] = useState(false);

  useEffect(() => {
    fetch("/api/ministries")
      .then((res) => res.json())
      .then((data) => setMinistries(data.data || []))
      .catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EventInput>({
    resolver: zodResolver(eventSchema),
    defaultValues: event
      ? {
          title: event.title,
          description: event.description,
          date: event.date,
          endDate: event.endDate || "",
          location: event.location,
          address: event.address || "",
          maxVolunteers: event.maxVolunteers,
          whatToBring: event.whatToBring || [],
          ministryId: event.ministryId || "",
          imageUrl: event.imageUrl || "",
          isExternal: event.isExternal || false,
          isRecurring: event.isRecurring || false,
          recurrencePattern: event.recurrencePattern || "",
          externalOrganizer: event.externalOrganizer || "",
        }
      : {
          title: defaultTitle || "",
          description: defaultDescription || "",
        },
  });

  const watchIsExternal = watch("isExternal");
  const watchIsRecurring = watch("isRecurring");

  const createMinistry = async () => {
    if (!newMinistryName.trim()) return;
    setCreatingMinistry(true);
    try {
      const res = await fetch("/api/ministries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newMinistryName }),
      });
      if (res.ok) {
        const result = await res.json();
        const created = result.data;
        setMinistries((prev) => [...prev, created]);
        setValue("ministryId", created.id);
        setNewMinistryName("");
        setShowNewMinistry(false);
      }
    } catch {}
    setCreatingMinistry(false);
  };

  const onSubmit = async (data: EventInput) => {
    setServerError("");
    try {
      const payload = {
        ...data,
        maxVolunteers: data.maxVolunteers ? Number(data.maxVolunteers) : undefined,
        whatToBring: data.whatToBring?.filter(Boolean) || [],
        isExternal: data.isExternal || false,
        isRecurring: data.isRecurring || false,
        recurrencePattern: data.recurrencePattern || undefined,
        externalOrganizer: data.externalOrganizer || undefined,
      };

      const url = isEditing ? `/api/events/${event!.id}` : "/api/events";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        setServerError(err.error || `Failed to ${isEditing ? "update" : "create"} event.`);
        return;
      }

      if (!isEditing && ideaId) {
        await fetch(`/api/ideas/${ideaId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "IN_PLANNING" }),
        });
      }

      router.push(isEditing ? `/admin/events/${event!.id}` : "/admin/events");
      router.refresh();
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  const backHref = isEditing ? `/admin/events/${event!.id}` : "/admin/events";

  return (
    <Container size="md">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" />
        {isEditing ? "Back to Event" : "Back to Events"}
      </Link>

      <h1 className="mt-4 font-display text-2xl font-bold text-primary-900">
        {isEditing ? "Edit Event" : "Create New Event"}
      </h1>

      <Card className="mt-6">
        <CardHeader>
          <h2 className="text-lg font-semibold text-primary-900">
            {isEditing ? "Update Event Details" : "Event Details"}
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {serverError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {serverError}
              </div>
            )}

            {/* Basic Information */}
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-primary-900">Basic Information</legend>
              <Input
                label="Event Title"
                id="title"
                placeholder="e.g., Community Garden Day"
                error={errors.title?.message}
                {...register("title")}
              />
              <Textarea
                label="Description"
                id="description"
                placeholder="Describe what volunteers will be doing, who it helps, and any important details..."
                error={errors.description?.message}
                {...register("description")}
              />
            </fieldset>

            {/* Date & Location */}
            <fieldset className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <legend className="px-1 text-sm font-semibold text-primary-900">Date & Location</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Start Date & Time"
                  id="date"
                  type="datetime-local"
                  error={errors.date?.message}
                  {...register("date")}
                />
                <Input
                  label="End Date & Time (optional)"
                  id="endDate"
                  type="datetime-local"
                  error={errors.endDate?.message}
                  {...register("endDate")}
                />
              </div>
              <Input
                label="Location"
                id="location"
                placeholder="e.g., St. Elias Church Hall"
                error={errors.location?.message}
                {...register("location")}
              />
              <Input
                label="Full Address (optional)"
                id="address"
                placeholder="408 East 11th Street, Austin, TX 78701"
                error={errors.address?.message}
                {...register("address")}
              />
            </fieldset>

            {/* Additional Settings */}
            <fieldset className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <legend className="px-1 text-sm font-semibold text-primary-900">Additional Settings</legend>

              <Input
                label="Max Volunteers (optional)"
                id="maxVolunteers"
                type="number"
                placeholder="Leave empty for unlimited"
                error={errors.maxVolunteers?.message}
                {...register("maxVolunteers", {
                  setValueAs: (v: string) => v === "" ? undefined : Number(v),
                })}
              />

              {/* Ministry Selection with inline create */}
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Select
                      label="Ministry (optional)"
                      id="ministryId"
                      options={ministries.map((m) => ({ value: m.id, label: m.name }))}
                      placeholder="Select ministry..."
                      error={errors.ministryId?.message}
                      {...register("ministryId")}
                    />
                  </div>
                  <div className="pt-5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNewMinistry(!showNewMinistry)}
                    >
                      <Plus className="h-4 w-4" />
                      New
                    </Button>
                  </div>
                </div>
                {showNewMinistry && (
                  <div className="mt-2 flex items-end gap-2 rounded-lg border border-gray-200 bg-white p-3">
                    <div className="flex-1">
                      <Input
                        label="Ministry Name"
                        id="new-ministry-name"
                        placeholder="e.g., Youth Ministry"
                        value={newMinistryName}
                        onChange={(e) => setNewMinistryName(e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={createMinistry}
                      isLoading={creatingMinistry}
                    >
                      Add
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNewMinistry(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {/* Opportunity Type */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">
                  Opportunity Type
                </h3>
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      {...register("isExternal")}
                    />
                    External event (not hosted by St. Elias)
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      {...register("isRecurring")}
                    />
                    Recurring event
                  </label>
                </div>

                {watchIsExternal && (
                  <Input
                    label="External Organizer"
                    id="externalOrganizer"
                    placeholder="e.g., Austin Food Bank, Habitat for Humanity"
                    error={errors.externalOrganizer?.message}
                    {...register("externalOrganizer")}
                  />
                )}

                {watchIsRecurring && (
                  <Select
                    label="Recurrence Pattern"
                    id="recurrencePattern"
                    options={[
                      { value: "weekly", label: "Weekly" },
                      { value: "biweekly", label: "Every 2 weeks" },
                      { value: "monthly", label: "Monthly" },
                      { value: "first-saturday", label: "First Saturday of month" },
                    ]}
                    placeholder="Select pattern..."
                    error={errors.recurrencePattern?.message}
                    {...register("recurrencePattern")}
                  />
                )}
              </div>

              <Input
                label="Event Image URL (optional)"
                id="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                error={errors.imageUrl?.message}
                {...register("imageUrl")}
              />
            </fieldset>

            <div className="flex justify-end gap-3 pt-4">
              <Link href={backHref}>
                <Button variant="ghost" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" isLoading={isSubmitting}>
                {isEditing ? "Update Event" : "Create Event"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
