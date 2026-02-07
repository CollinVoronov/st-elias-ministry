"use client";

import { useState, useEffect } from "react";
import { Building2, Plus } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

interface MinistryData {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
}

export default function AdminMinistriesPage() {
  const [ministries, setMinistries] = useState<MinistryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#4263eb");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/ministries")
      .then((res) => res.json())
      .then((data) => {
        setMinistries(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);

    const res = await fetch("/api/ministries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: description || null, color }),
    });

    if (res.ok) {
      const result = await res.json();
      setMinistries((prev) => [...prev, result.data]);
      setName("");
      setDescription("");
      setShowForm(false);
    }
    setSubmitting(false);
  };

  return (
    <Container>
      <SectionHeader
        title="Ministries"
        description="Organize events by ministry or team."
        action={
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4" />
            Add Ministry
          </Button>
        }
      />

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mt-6 rounded-xl border border-gray-200 bg-white p-6 space-y-4"
        >
          <Input
            label="Ministry Name"
            id="ministry-name"
            placeholder="e.g., Youth Ministry"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Description (optional)"
            id="ministry-desc"
            placeholder="Brief description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Color
            </label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-20 cursor-pointer rounded border border-gray-300"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Create Ministry
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="mt-6 text-center text-sm text-gray-400">Loading...</div>
      ) : ministries.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ministries.map((ministry) => (
            <div
              key={ministry.id}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: ministry.color || "#4263eb" }}
                />
                <h3 className="font-semibold text-primary-900">{ministry.name}</h3>
              </div>
              {ministry.description && (
                <p className="mt-2 text-sm text-gray-600">{ministry.description}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            icon={Building2}
            title="No ministries"
            description="Add ministries to organize your events by team or department."
          />
        </div>
      )}
    </Container>
  );
}
