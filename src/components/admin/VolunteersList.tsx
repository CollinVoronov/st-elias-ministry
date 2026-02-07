"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface VolunteerData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  eventCount: number;
}

interface HistoryEntry {
  id: string;
  eventTitle: string;
  eventDate: string;
  roleName: string | null;
  status: string;
}

export function VolunteersList({ volunteers }: { volunteers: VolunteerData[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [historyCache, setHistoryCache] = useState<Record<string, HistoryEntry[]>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const toggleExpand = async (volunteerId: string) => {
    if (expandedId === volunteerId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(volunteerId);

    if (!historyCache[volunteerId]) {
      setLoadingId(volunteerId);
      try {
        const res = await fetch(`/api/volunteers/${volunteerId}/history`);
        if (res.ok) {
          const result = await res.json();
          setHistoryCache((prev) => ({ ...prev, [volunteerId]: result.data }));
        }
      } catch {
        // ignore
      }
      setLoadingId(null);
    }
  };

  const statusVariant: Record<string, "success" | "default" | "danger"> = {
    CONFIRMED: "success",
    WAITLISTED: "default",
    CANCELLED: "danger",
  };

  return (
    <table className="w-full">
      <thead className="bg-cream">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
            Name
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
            Email
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
            Phone
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
            Events
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
            Joined
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {volunteers.map((vol) => (
          <>
            <tr
              key={vol.id}
              className="cursor-pointer hover:bg-cream"
              onClick={() => toggleExpand(vol.id)}
            >
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                <div className="flex items-center gap-1.5">
                  {expandedId === vol.id ? (
                    <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                  )}
                  {vol.name}
                </div>
              </td>
              <td className="px-4 py-3">
                <a
                  href={`mailto:${vol.email}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800"
                >
                  <Mail className="h-3 w-3" />
                  {vol.email}
                </a>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {vol.phone ? (
                  <a
                    href={`tel:${vol.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1"
                  >
                    <Phone className="h-3 w-3" />
                    {vol.phone}
                  </a>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {vol.eventCount} event{vol.eventCount !== 1 ? "s" : ""}
              </td>
              <td className="px-4 py-3 text-sm text-gray-400">
                {new Date(vol.createdAt).toLocaleDateString()}
              </td>
            </tr>
            {expandedId === vol.id && (
              <tr key={`${vol.id}-history`}>
                <td colSpan={5} className="bg-gray-50 px-8 py-3">
                  {loadingId === vol.id ? (
                    <p className="text-sm text-gray-400">Loading history...</p>
                  ) : historyCache[vol.id]?.length ? (
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase text-gray-500">
                        Event History
                      </p>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs text-gray-400">
                            <th className="pb-1 pr-4">Event</th>
                            <th className="pb-1 pr-4">Date</th>
                            <th className="pb-1 pr-4">Role</th>
                            <th className="pb-1">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {historyCache[vol.id].map((entry) => (
                            <tr key={entry.id} className="text-gray-600">
                              <td className="py-1 pr-4 font-medium text-gray-900">
                                {entry.eventTitle}
                              </td>
                              <td className="py-1 pr-4">
                                {new Date(entry.eventDate).toLocaleDateString()}
                              </td>
                              <td className="py-1 pr-4">{entry.roleName || "—"}</td>
                              <td className="py-1">
                                <Badge variant={statusVariant[entry.status] || "default"}>
                                  {entry.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No event history found.</p>
                  )}
                </td>
              </tr>
            )}
          </>
        ))}
      </tbody>
    </table>
  );
}
