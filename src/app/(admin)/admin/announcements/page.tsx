"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Megaphone, Plus, Trash2, Pin, Pencil, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Toggle } from "@/components/ui/Toggle";
import { announcementSchema, type AnnouncementInput } from "@/lib/validations";

interface AnnouncementData {
  id: string;
  title: string;
  body: string;
  previewText: string | null;
  isPinned: boolean;
  publishedAt: string;
  expiresAt: string | null;
  status: string;
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AnnouncementInput>({
    resolver: zodResolver(announcementSchema),
  });

  const watchIsPinned = watch("isPinned");

  useEffect(() => {
    fetch("/api/announcements")
      .then((res) => res.json())
      .then((data) => {
        setAnnouncements(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const startEditing = (ann: AnnouncementData) => {
    setEditingId(ann.id);
    setShowForm(true);
    reset({
      title: ann.title,
      body: ann.body,
      previewText: ann.previewText ?? "",
      isPinned: ann.isPinned,
      expiresAt: ann.expiresAt ?? "",
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setShowForm(false);
    reset();
  };

  const onSubmit = async (data: AnnouncementInput) => {
    if (editingId) {
      const res = await fetch(`/api/announcements/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const result = await res.json();
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === editingId ? result.data : a))
        );
        setEditingId(null);
        setShowForm(false);
        reset();
      }
    } else {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const result = await res.json();
        setAnnouncements((prev) => [result.data, ...prev]);
        setShowForm(false);
        reset();
      }
    }
  };

  const deleteAnnouncement = async (id: string) => {
    const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const approveAnnouncement = async (id: string) => {
    const res = await fetch(`/api/announcements/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PUBLISHED" }),
    });

    if (res.ok) {
      const result = await res.json();
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? result.data : a))
      );
    }
  };

  const cancelOrClose = () => {
    if (editingId) {
      cancelEditing();
    } else {
      setShowForm(false);
      reset();
    }
  };

  return (
    <Container>
      {showForm ? (
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-[500px] flex-col">
            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={cancelOrClose}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
                <h2 className="text-lg font-semibold text-primary-900">
                  {editingId ? "Edit Announcement" : "New Announcement"}
                </h2>
              </div>
              <Button type="submit" isLoading={isSubmitting} size="sm">
                {editingId ? "Save Changes" : "Publish"}
              </Button>
            </div>

            {/* Subject row */}
            <div className="border-b border-gray-100 py-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-400 select-none">Subject</span>
                <input
                  {...register("title")}
                  className="flex-1 border-0 bg-transparent p-0 text-base font-medium text-primary-900 placeholder:text-gray-300 focus:ring-0 focus:outline-none"
                  placeholder="Announcement subject line"
                />
              </div>
              {errors.title && <p className="mt-1 pl-16 text-xs text-red-500">{errors.title.message}</p>}
            </div>

            {/* Preview text row */}
            <div className="border-b border-gray-100 py-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-400 select-none">Preview</span>
                <input
                  {...register("previewText")}
                  className="flex-1 border-0 bg-transparent p-0 text-sm text-gray-600 placeholder:text-gray-300 focus:ring-0 focus:outline-none"
                  placeholder="Short summary for email previews (optional)"
                />
              </div>
            </div>

            {/* Body area */}
            <div className="flex-1 py-4">
              <textarea
                {...register("body")}
                className="block w-full resize-none border-0 bg-transparent p-0 text-sm leading-relaxed text-gray-800 placeholder:text-gray-300 focus:ring-0 focus:outline-none"
                placeholder="Write your announcement..."
                rows={12}
                style={{ minHeight: "240px" }}
              />
              {errors.body && <p className="mt-1 text-xs text-red-500">{errors.body.message}</p>}
            </div>

            {/* Bottom metadata bar */}
            <div className="space-y-3 border-t border-gray-100 pt-4">
              <Controller
                name="isPinned"
                control={control}
                render={({ field }) => (
                  <Toggle
                    label="Show on landing page"
                    description="Pin this announcement to the public homepage"
                    checked={field.value ?? false}
                    onChange={field.onChange}
                  />
                )}
              />
              <AnimatePresence>
                {watchIsPinned && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <Input label="Expires at" id="expiresAt" type="datetime-local" {...register("expiresAt")} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </form>
        </div>
      ) : (
        <>
          <SectionHeader
            title="Announcements"
            description="Create and manage announcements shown on the public site."
            action={
              <Button onClick={() => {
                if (editingId) {
                  cancelEditing();
                }
                setShowForm(!showForm);
              }}>
                <Plus className="h-4 w-4" />
                New Announcement
              </Button>
            }
          />

          {loading ? (
            <div className="mt-6 text-center text-sm text-gray-400">Loading...</div>
          ) : announcements.length > 0 ? (
            <div className="mt-6 space-y-3">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="flex items-start justify-between rounded-xl border border-gray-200 bg-white p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-primary-900">{ann.title}</h3>
                      {ann.isPinned && (
                        <Badge variant="info">
                          <Pin className="mr-1 h-3 w-3" />
                          On Landing Page
                        </Badge>
                      )}
                      {ann.status === "PUBLISHED" ? (
                        <Badge variant="success">Published</Badge>
                      ) : ann.status === "DRAFT" ? (
                        <Badge variant="warning">Pending Approval</Badge>
                      ) : null}
                    </div>
                    {ann.previewText && (
                      <p className="mt-1 text-sm text-gray-500 italic">{ann.previewText}</p>
                    )}
                    <p className="mt-1 text-sm text-gray-600">{ann.body}</p>
                    <p className="mt-2 text-xs text-gray-400">
                      Published {new Date(ann.publishedAt).toLocaleDateString()}
                      {ann.expiresAt && ` · Expires ${new Date(ann.expiresAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditing(ann)}
                    >
                      <Pencil className="h-4 w-4 text-gray-500" />
                    </Button>
                    {ann.status === "DRAFT" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => approveAnnouncement(ann.id)}
                      >
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAnnouncement(ann.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState
                icon={Megaphone}
                title="No announcements"
                description="Create an announcement to display on the public site."
              />
            </div>
          )}
        </>
      )}
    </Container>
  );
}
