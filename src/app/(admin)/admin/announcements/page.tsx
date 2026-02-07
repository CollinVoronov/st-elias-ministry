"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Megaphone, Plus, Trash2, Pin, Pencil, Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
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

  return (
    <Container>
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

      {showForm && (
        <Card className="mt-6">
          <CardHeader>
            <h2 className="text-lg font-semibold text-primary-900">
              {editingId ? "Edit Announcement" : "New Announcement"}
            </h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Subject"
                id="title"
                required
                placeholder="Announcement subject line"
                error={errors.title?.message}
                {...register("title")}
              />
              <Textarea
                label="Message"
                id="body"
                required
                placeholder="What do you want to announce?"
                error={errors.body?.message}
                {...register("body")}
              />
              <Input
                label="Preview Text"
                id="previewText"
                placeholder="Short summary for email previews"
                error={errors.previewText?.message}
                {...register("previewText")}
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPinned"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  {...register("isPinned")}
                />
                <label htmlFor="isPinned" className="text-sm text-gray-700">
                  Show on landing page
                </label>
              </div>
              {watchIsPinned && (
                <Input
                  label="Expires At"
                  id="expiresAt"
                  type="datetime-local"
                  {...register("expiresAt")}
                />
              )}
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={editingId ? cancelEditing : () => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  {editingId ? "Save Changes" : "Publish"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

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
    </Container>
  );
}
