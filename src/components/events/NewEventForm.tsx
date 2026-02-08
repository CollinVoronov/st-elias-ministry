"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Plus, Trash2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { eventSchema, type EventInput } from "@/lib/validations";

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="pt-8 pb-4 first:pt-0">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-600">{title}</h3>
        <div className="mt-1 border-b border-gray-200" />
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

interface RoleInput {
  name: string;
  description: string;
  spotsNeeded: number;
}

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
  roles?: Array<{ id: string; name: string; description: string | null; spotsNeeded: number }>;
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
  const [newMinistryColor, setNewMinistryColor] = useState("#4263eb");
  const [creatingMinistry, setCreatingMinistry] = useState(false);
  const [roles, setRoles] = useState<RoleInput[]>(
    event?.roles?.map((r) => ({ name: r.name, description: r.description || "", spotsNeeded: r.spotsNeeded })) || []
  );
  const [rolesExpanded, setRolesExpanded] = useState(!!event?.roles?.length);

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
    control,
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
        body: JSON.stringify({ name: newMinistryName, color: newMinistryColor }),
      });
      if (res.ok) {
        const result = await res.json();
        const created = result.data;
        setMinistries((prev) => [...prev, created]);
        setValue("ministryId", created.id);
        setNewMinistryName("");
        setNewMinistryColor("#4263eb");
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
        roles: roles.filter((r) => r.name.trim()),
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

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
          <AnimatePresence>
            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {serverError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Basic Information */}
          <FormSection title="Basic Information">
            <Input
              label="Event Title"
              id="title"
              required
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
          </FormSection>

          {/* Date & Location */}
          <FormSection title="Date & Location">
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
              placeholder="e.g., St. Elias Church Hall"
              error={errors.location?.message}
              {...register("location")}
            />
            <Input
              label="Full Address"
              id="address"
              placeholder="408 East 11th Street, Austin, TX 78701"
              error={errors.address?.message}
              {...register("address")}
            />
          </FormSection>

          {/* Settings */}
          <FormSection title="Settings">
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

            {/* Ministry Selection */}
            <div>
              <Select
                label="Ministry"
                id="ministryId"
                options={ministries.map((m) => ({ value: m.id, label: m.name }))}
                placeholder="Select ministry..."
                error={errors.ministryId?.message}
                {...register("ministryId")}
              />
              {!showNewMinistry && (
                <button
                  type="button"
                  onClick={() => setShowNewMinistry(true)}
                  className="mt-1 inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create new ministry
                </button>
              )}
              <AnimatePresence>
                {showNewMinistry && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 flex items-end gap-2 rounded-xl border border-primary-100 bg-primary-50/30 p-3">
                      <div className="flex-1">
                        <Input
                          label="Ministry Name"
                          id="new-ministry-name"
                          placeholder="e.g., Youth Ministry"
                          value={newMinistryName}
                          onChange={(e) => setNewMinistryName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor="new-ministry-color" className="mb-1 block text-sm font-medium text-gray-700">
                          Color
                        </label>
                        <input
                          type="color"
                          id="new-ministry-color"
                          value={newMinistryColor}
                          onChange={(e) => setNewMinistryColor(e.target.value)}
                          className="h-[38px] w-12 cursor-pointer rounded-lg border border-gray-300"
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Toggles for isExternal and isRecurring */}
            <div className="space-y-3 rounded-xl bg-gray-50/50 p-4">
              <Controller
                name="isExternal"
                control={control}
                render={({ field }) => (
                  <Toggle
                    label="External event"
                    description="Not hosted by St. Elias"
                    checked={field.value ?? false}
                    onChange={field.onChange}
                  />
                )}
              />
              <AnimatePresence>
                {watchIsExternal && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3">
                      <Input
                        label="External Organizer"
                        id="externalOrganizer"
                        placeholder="e.g., Austin Food Bank, Habitat for Humanity"
                        error={errors.externalOrganizer?.message}
                        {...register("externalOrganizer")}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Controller
                name="isRecurring"
                control={control}
                render={({ field }) => (
                  <Toggle
                    label="Recurring event"
                    description="Repeats on a schedule"
                    checked={field.value ?? false}
                    onChange={field.onChange}
                  />
                )}
              />
              <AnimatePresence>
                {watchIsRecurring && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3">
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
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Input
              label="Event Image URL"
              id="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              error={errors.imageUrl?.message}
              {...register("imageUrl")}
            />
          </FormSection>

          {/* Volunteer Roles */}
          <FormSection title="Volunteer Roles">
            <p className="text-sm text-gray-500">
              Define specific roles volunteers can sign up for (e.g., &quot;Kitchen Helper&quot;, &quot;Setup Crew&quot;).
            </p>

            {roles.length === 0 && !rolesExpanded ? (
              <button
                type="button"
                onClick={() => {
                  setRolesExpanded(true);
                  setRoles([...roles, { name: "", description: "", spotsNeeded: 1 }]);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-6 text-sm text-gray-500 transition-colors hover:border-primary-300 hover:text-primary-600"
              >
                <Plus className="h-4 w-4" /> Add volunteer roles
              </button>
            ) : (
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {roles.map((role, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4"
                    >
                      <div className="flex-1 space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Input
                            label="Role Name"
                            id={`role-name-${index}`}
                            required
                            placeholder="e.g., Kitchen Helper"
                            value={role.name}
                            onChange={(e) => {
                              const updated = [...roles];
                              updated[index] = { ...updated[index], name: e.target.value };
                              setRoles(updated);
                            }}
                          />
                          <Input
                            label="Spots Needed"
                            id={`role-spots-${index}`}
                            type="number"
                            min={1}
                            value={role.spotsNeeded}
                            onChange={(e) => {
                              const updated = [...roles];
                              updated[index] = { ...updated[index], spotsNeeded: Number(e.target.value) || 1 };
                              setRoles(updated);
                            }}
                          />
                        </div>
                        <Input
                          label="Description (optional)"
                          id={`role-desc-${index}`}
                          placeholder="Brief description of this role..."
                          value={role.description}
                          onChange={(e) => {
                            const updated = [...roles];
                            updated[index] = { ...updated[index], description: e.target.value };
                            setRoles(updated);
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        className="mt-6 rounded-lg p-2 text-gray-300 hover:bg-red-50 hover:text-red-500"
                        onClick={() => setRoles(roles.filter((_, i) => i !== index))}
                        title="Remove role"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setRoles([...roles, { name: "", description: "", spotsNeeded: 1 }])
                  }
                >
                  <Plus className="h-4 w-4" />
                  Add Role
                </Button>
              </div>
            )}
          </FormSection>

          {/* Sticky form actions */}
          <div className="sticky bottom-0 -mx-6 sm:-mx-8 mt-8 border-t border-gray-100 bg-white/80 backdrop-blur-sm px-6 sm:px-8 py-4">
            <div className="flex justify-end gap-3">
              <Link href={backHref}>
                <Button variant="ghost" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" isLoading={isSubmitting}>
                {isEditing ? "Update Event" : "Create Event"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Container>
  );
}
