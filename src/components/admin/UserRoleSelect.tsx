"use client";

import { useState } from "react";

interface UserRoleSelectProps {
  userId: string;
  currentRole: string;
  isSelf: boolean;
}

const ROLES = [
  { value: "ADMIN", label: "Admin" },
  { value: "ORGANIZER", label: "Organizer" },
  { value: "COMMUNITY", label: "Community" },
];

export function UserRoleSelect({ userId, currentRole, isSelf }: UserRoleSelectProps) {
  const [role, setRole] = useState(currentRole);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = async (newRole: string) => {
    setSaving(true);
    setSaved(false);
    const res = await fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });

    if (res.ok) {
      setRole(newRole);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={role}
        onChange={(e) => handleChange(e.target.value)}
        disabled={saving || isSelf}
        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
      >
        {ROLES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      {saved && <span className="text-xs text-green-600">Saved</span>}
      {isSelf && <span className="text-xs text-gray-400">(you)</span>}
    </div>
  );
}
