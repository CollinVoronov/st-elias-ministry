"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { eventSchema, type EventInput } from "@/lib/validations";

export default function NewEventPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [ministries, setMinistries] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/ministries")
      .then((res) => res.json())
      .then((data) => setMinistries(data.data || []))
      .catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EventInput>({
    resolver: zodResolver(eventSchema),
  });

  const onSubmit = async (data: EventInput) => {
    setServerError("");
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          maxVolunteers: data.maxVolunteers ? Number(data.maxVolunteers) : undefined,
          whatToBring: data.whatToBring?.filter(Boolean) || [],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setServerError(err.error || "Failed to create event.");
        return;
      }

      router.push("/admin/events");
      router.refresh();
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <Container size="md">
      <Link
        href="/admin/events"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Events
      </Link>

      <h1 className="mt-4 font-display text-2xl font-bold text-primary-900">
        Create New Event
      </h1>

      <Card className="mt-6">
        <CardHeader>
          <h2 className="text-lg font-semibold text-primary-900">Event Details</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {serverError}
              </div>
            )}

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

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Max Volunteers (optional)"
                id="maxVolunteers"
                type="number"
                placeholder="Leave empty for unlimited"
                error={errors.maxVolunteers?.message}
                {...register("maxVolunteers", { valueAsNumber: true })}
              />

              {ministries.length > 0 && (
                <Select
                  label="Ministry (optional)"
                  id="ministryId"
                  options={ministries.map((m) => ({ value: m.id, label: m.name }))}
                  placeholder="Select ministry..."
                  error={errors.ministryId?.message}
                  {...register("ministryId")}
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

            <div className="flex justify-end gap-3 pt-4">
              <Link href="/admin/events">
                <Button variant="ghost" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" isLoading={isSubmitting}>
                Create Event
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
