"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { eventSchema, type EventInput } from "@/lib/validations";

interface NewProposalFormProps {
  organizationName: string;
}

export function NewProposalForm({ organizationName }: NewProposalFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EventInput>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      externalOrganizer: organizationName,
    },
  });

  const onSubmit = async (data: EventInput) => {
    setServerError("");
    try {
      const payload = {
        ...data,
        maxVolunteers: data.maxVolunteers ? Number(data.maxVolunteers) : undefined,
        whatToBring: data.whatToBring?.filter(Boolean) || [],
      };

      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        setServerError(err.error || "Failed to submit proposal.");
        return;
      }

      router.push("/community/proposals");
      router.refresh();
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <div>
      <Link
        href="/community/proposals"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Proposals
      </Link>

      <h1 className="mt-4 font-display text-2xl font-bold text-primary-900">
        Submit New Proposal
      </h1>
      <p className="mt-1 text-sm text-gray-600">
        Propose a community service event. It will be reviewed by the church before being added to the calendar.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <h2 className="text-lg font-semibold text-primary-900">Event Details</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {serverError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {serverError}
              </div>
            )}

            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-primary-900">Basic Information</legend>
              <Input
                label="Event Title"
                id="title"
                required
                placeholder="e.g., Community Food Drive"
                error={errors.title?.message}
                {...register("title")}
              />
              <Textarea
                label="Description"
                id="description"
                placeholder="Describe the event, what volunteers will do, and who it helps..."
                error={errors.description?.message}
                {...register("description")}
              />
            </fieldset>

            <fieldset className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <legend className="px-1 text-sm font-semibold text-primary-900">Date & Location</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Start Date & Time"
                  id="date"
                  required
                  type="datetime-local"
                  error={errors.date?.message}
                  {...register("date")}
                />
                <Input
                  label="End Date & Time"
                  id="endDate"
                  type="datetime-local"
                  error={errors.endDate?.message}
                  {...register("endDate")}
                />
              </div>
              <Input
                label="Location"
                id="location"
                required
                placeholder="e.g., City Park Pavilion"
                error={errors.location?.message}
                {...register("location")}
              />
              <Input
                label="Full Address"
                id="address"
                placeholder="123 Main St, Austin, TX 78701"
                error={errors.address?.message}
                {...register("address")}
              />
            </fieldset>

            <fieldset className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <legend className="px-1 text-sm font-semibold text-primary-900">Additional Details</legend>
              <Input
                label="Max Volunteers"
                id="maxVolunteers"
                type="number"
                placeholder="Leave empty for unlimited"
                error={errors.maxVolunteers?.message}
                {...register("maxVolunteers", {
                  setValueAs: (v: string) => v === "" ? undefined : Number(v),
                })}
              />
              <Input
                label="Organization"
                id="externalOrganizer"
                value={organizationName}
                disabled
                {...register("externalOrganizer")}
              />
            </fieldset>

            <div className="flex justify-end gap-3 pt-4">
              <Link href="/community/proposals">
                <Button variant="ghost" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" isLoading={isSubmitting}>
                Submit Proposal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
