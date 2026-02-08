"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus, Check, X, Palette } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface MinistryData {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  _count: { events: number };
}

interface EditState {
  name: string;
  description: string;
  color: string;
}

export function MinistryList({
  initialMinistries,
}: {
  initialMinistries: MinistryData[];
}) {
  const [ministries, setMinistries] = useState(initialMinistries);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({ name: "", description: "", color: "#1e3a5f" });
  const [showCreate, setShowCreate] = useState(false);
  const [createState, setCreateState] = useState<EditState>({ name: "", description: "", color: "#1e3a5f" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startEdit = (m: MinistryData) => {
    setEditingId(m.id);
    setEditState({
      name: m.name,
      description: m.description || "",
      color: m.color || "#1e3a5f",
    });
    setShowCreate(false);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setError(null);
  };

  const saveEdit = async () => {
    if (!editingId || !editState.name.trim()) return;
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/ministries/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editState),
    });

    if (res.ok) {
      const { data } = await res.json();
      setMinistries((prev) =>
        prev.map((m) => (m.id === editingId ? { ...m, ...data } : m))
      );
      setEditingId(null);
    } else {
      const { error } = await res.json();
      setError(error || "Failed to update");
    }
    setSaving(false);
  };

  const deleteMinistry = async (id: string) => {
    setError(null);
    const res = await fetch(`/api/ministries/${id}`, { method: "DELETE" });

    if (res.ok) {
      setMinistries((prev) => prev.filter((m) => m.id !== id));
    } else {
      const { error } = await res.json();
      setError(error || "Failed to delete");
    }
  };

  const createMinistry = async () => {
    if (!createState.name.trim()) return;
    setSaving(true);
    setError(null);

    const res = await fetch("/api/ministries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createState),
    });

    if (res.ok) {
      const { data } = await res.json();
      setMinistries((prev) => [...prev, { ...data, _count: { events: 0 } }]);
      setShowCreate(false);
      setCreateState({ name: "", description: "", color: "#1e3a5f" });
    } else {
      const { error } = await res.json();
      setError(error || "Failed to create");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={() => {
          setShowCreate(!showCreate);
          setEditingId(null);
          setError(null);
        }}
        size="sm"
      >
        <Plus className="h-4 w-4" />
        Add Ministry
      </Button>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {showCreate && (
        <div className="rounded-xl border border-primary-200 bg-primary-50/30 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={createState.color}
                onChange={(e) => setCreateState((s) => ({ ...s, color: e.target.value }))}
                className="h-9 w-9 cursor-pointer rounded border border-gray-200"
              />
              <div className="flex-1 space-y-2">
                <input
                  value={createState.name}
                  onChange={(e) => setCreateState((s) => ({ ...s, name: e.target.value }))}
                  placeholder="Ministry name"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                />
                <input
                  value={createState.description}
                  onChange={(e) => setCreateState((s) => ({ ...s, description: e.target.value }))}
                  placeholder="Description (optional)"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={createMinistry} disabled={saving}>
                <Check className="h-4 w-4" />
                Create
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowCreate(false);
                  setCreateState({ name: "", description: "", color: "#1e3a5f" });
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {ministries.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-8 text-center">
          <Palette className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">No ministries yet.</p>
        </div>
      ) : (
        ministries.map((m) => (
          <div
            key={m.id}
            className="rounded-xl border border-gray-200 bg-white p-4"
          >
            {editingId === m.id ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={editState.color}
                    onChange={(e) => setEditState((s) => ({ ...s, color: e.target.value }))}
                    className="h-9 w-9 cursor-pointer rounded border border-gray-200"
                  />
                  <div className="flex-1 space-y-2">
                    <input
                      value={editState.name}
                      onChange={(e) => setEditState((s) => ({ ...s, name: e.target.value }))}
                      placeholder="Ministry name"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                    />
                    <input
                      value={editState.description}
                      onChange={(e) => setEditState((s) => ({ ...s, description: e.target.value }))}
                      placeholder="Description (optional)"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveEdit} disabled={saving}>
                    <Check className="h-4 w-4" />
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelEdit}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="inline-block h-4 w-4 rounded-full"
                    style={{ backgroundColor: m.color || "#6b7280" }}
                  />
                  <div>
                    <h3 className="font-medium text-primary-900">{m.name}</h3>
                    {m.description && (
                      <p className="text-sm text-gray-500">{m.description}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {m._count.events} event{m._count.events !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(m)}>
                    <Pencil className="h-4 w-4 text-gray-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMinistry(m.id)}
                    disabled={m._count.events > 0}
                    title={m._count.events > 0 ? "Remove events first" : "Delete ministry"}
                  >
                    <Trash2 className={`h-4 w-4 ${m._count.events > 0 ? "text-gray-300" : "text-red-500"}`} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
