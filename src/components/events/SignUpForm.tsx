"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { volunteerSignUpSchema, type VolunteerSignUpInput } from "@/lib/validations";

interface SignUpFormProps {
  eventId: string;
  roles: { id: string; name: string; spotsNeeded: number; _count?: { rsvps: number } }[];
}

export function SignUpForm({ eventId, roles }: SignUpFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VolunteerSignUpInput>({
    resolver: zodResolver(volunteerSignUpSchema),
  });

  const onSubmit = async (data: VolunteerSignUpInput) => {
    setServerError("");
    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        setServerError(err.error || "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
        <h3 className="mt-3 text-lg font-semibold text-green-900">
          You&apos;re signed up!
        </h3>
        <p className="mt-1 text-sm text-green-700">
          Thank you for volunteering. You&apos;ll receive a confirmation email shortly.
        </p>
      </div>
    );
  }

  const roleOptions = roles.map((role) => ({
    value: role.id,
    label: `${role.name}${
      role._count
        ? ` (${role.spotsNeeded - (role._count.rsvps || 0)} spots left)`
        : ""
    }`,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Sign Up to Volunteer</h3>

      {serverError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <Input
        label="Full Name"
        id="name"
        placeholder="Enter your full name"
        error={errors.name?.message}
        {...register("name")}
      />

      <Input
        label="Email"
        id="email"
        type="email"
        placeholder="your@email.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <Input
        label="Phone (optional)"
        id="phone"
        type="tel"
        placeholder="(512) 555-0123"
        error={errors.phone?.message}
        {...register("phone")}
      />

      {roles.length > 0 && (
        <Select
          label="Role (optional)"
          id="roleId"
          options={roleOptions}
          placeholder="Select a role..."
          error={errors.roleId?.message}
          {...register("roleId")}
        />
      )}

      <Textarea
        label="Note (optional)"
        id="note"
        placeholder="Any dietary restrictions, questions, or comments?"
        error={errors.note?.message}
        {...register("note")}
      />

      <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
        Sign Up
      </Button>
    </form>
  );
}
