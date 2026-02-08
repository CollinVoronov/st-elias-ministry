"use client";

import { useState, useCallback } from "react";
import { Mail, Phone, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface VolunteerInfo {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

interface RoleInfo {
  id: string;
  name: string;
}

interface RSVPItem {
  id: string;
  status: string;
  note: string | null;
  createdAt: string;
  volunteer: VolunteerInfo;
  role: RoleInfo | null;
}

interface HistoryEntry {
  id: string;
  eventTitle: string;
  eventDate: string;
  roleName: string | null;
  status: string;
}

interface VolunteerTableProps {
  eventId: string;
  rsvps: RSVPItem[];
  roles: RoleInfo[];
  isAdmin: boolean;
}

const statusBadgeVariant: Record<string, "success" | "warning" | "danger" | "default"> = {
  CONFIRMED: "success",
  WAITLISTED: "warning",
  CANCELLED: "danger",
};

export function VolunteerTable({ eventId, rsvps, roles, isAdmin }: VolunteerTableProps) {
  const [rsvpData, setRsvpData] = useState<RSVPItem[]>(rsvps);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [expandedVolunteer, setExpandedVolunteer] = useState<string | null>(null);
  const [historyMap, setHistoryMap] = useState<Record<string, HistoryEntry[]>>({});
  const [loadingHistory, setLoadingHistory] = useState<string | null>(null);

  const handleUpdate = useCallback(
    async (rsvpId: string, updates: { roleId?: string | null; status?: string }) => {
      setSavingId(rsvpId);
      setSavedId(null);

      try {
        const res = await fetch(`/api/events/${eventId}/rsvp`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rsvpId, ...updates }),
        });

        if (!res.ok) {
          console.error("Failed to update RSVP");
          return;
        }

        const { data } = await res.json();

        setRsvpData((prev) =>
          prev.map((r) =>
            r.id === rsvpId
              ? {
                  ...r,
                  status: data.status,
                  role: data.role ? { id: data.role.id, name: data.role.name } : null,
                }
              : r
          )
        );

        setSavedId(rsvpId);
        setTimeout(() => setSavedId(null), 2000);
      } catch (err) {
        console.error("Failed to update RSVP:", err);
      } finally {
        setSavingId(null);
      }
    },
    [eventId]
  );

  const toggleHistory = useCallback(
    async (volunteerId: string) => {
      if (expandedVolunteer === volunteerId) {
        setExpandedVolunteer(null);
        return;
      }

      setExpandedVolunteer(volunteerId);

      if (!historyMap[volunteerId]) {
        setLoadingHistory(volunteerId);
        try {
          const res = await fetch(`/api/volunteers/${volunteerId}/history`);
          if (res.ok) {
            const { data } = await res.json();
            setHistoryMap((prev) => ({ ...prev, [volunteerId]: data }));
          }
        } catch (err) {
          console.error("Failed to fetch volunteer history:", err);
        } finally {
          setLoadingHistory(null);
        }
      }
    },
    [expandedVolunteer, historyMap]
  );

  if (rsvpData.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-400">
        No volunteers signed up yet.
      </div>
    );
  }

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
            Role
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
            Status
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
            Signed Up
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {rsvpData.map((rsvp) => {
          const isExpanded = expandedVolunteer === rsvp.volunteer.id;
          const history = historyMap[rsvp.volunteer.id];
          const isLoadingThis = loadingHistory === rsvp.volunteer.id;

          return (
            <VolunteerRow
              key={rsvp.id}
              rsvp={rsvp}
              roles={roles}
              isAdmin={isAdmin}
              isExpanded={isExpanded}
              history={history}
              isLoadingHistory={isLoadingThis}
              isSaving={savingId === rsvp.id}
              isSaved={savedId === rsvp.id}
              onUpdate={handleUpdate}
              onToggleHistory={toggleHistory}
            />
          );
        })}
      </tbody>
    </table>
  );
}

interface VolunteerRowProps {
  rsvp: RSVPItem;
  roles: RoleInfo[];
  isAdmin: boolean;
  isExpanded: boolean;
  history: HistoryEntry[] | undefined;
  isLoadingHistory: boolean;
  isSaving: boolean;
  isSaved: boolean;
  onUpdate: (rsvpId: string, updates: { roleId?: string | null; status?: string }) => void;
  onToggleHistory: (volunteerId: string) => void;
}

function VolunteerRow({
  rsvp,
  roles,
  isAdmin,
  isExpanded,
  history,
  isLoadingHistory,
  isSaving,
  isSaved,
  onUpdate,
  onToggleHistory,
}: VolunteerRowProps) {
  const ChevronIcon = isExpanded ? ChevronUp : ChevronDown;

  return (
    <>
      <tr className="hover:bg-cream">
        <td className="px-4 py-3 text-sm font-medium text-gray-900">
          <button
            type="button"
            onClick={() => onToggleHistory(rsvp.volunteer.id)}
            className="inline-flex items-center gap-1 text-left hover:text-primary-700"
          >
            <ChevronIcon className="h-3 w-3 flex-shrink-0 text-gray-400" />
            {rsvp.volunteer.name}
          </button>
        </td>
        <td className="px-4 py-3">
          <a
            href={`mailto:${rsvp.volunteer.email}`}
            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800"
          >
            <Mail className="h-3 w-3" />
            {rsvp.volunteer.email}
          </a>
        </td>
        <td className="px-4 py-3">
          {rsvp.volunteer.phone ? (
            <a
              href={`tel:${rsvp.volunteer.phone}`}
              className="flex items-center gap-1 text-sm text-gray-600"
            >
              <Phone className="h-3 w-3" />
              {rsvp.volunteer.phone}
            </a>
          ) : (
            <span className="text-sm text-gray-300">&mdash;</span>
          )}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {isAdmin ? (
            <select
              className="min-w-[120px] rounded border border-gray-200 bg-white py-1 pl-2 pr-7 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              value={rsvp.role?.id ?? ""}
              disabled={isSaving}
              onChange={(e) => {
                const newRoleId = e.target.value || null;
                onUpdate(rsvp.id, { roleId: newRoleId });
              }}
            >
              <option value="">None</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          ) : (
            rsvp.role?.name || "\u2014"
          )}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <select
                className="min-w-[120px] rounded border border-gray-200 bg-white py-1 pl-2 pr-7 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                value={rsvp.status}
                disabled={isSaving}
                onChange={(e) => {
                  onUpdate(rsvp.id, { status: e.target.value });
                }}
              >
                <option value="CONFIRMED">Confirmed</option>
                <option value="WAITLISTED">Waitlisted</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            ) : (
              <Badge variant={statusBadgeVariant[rsvp.status] ?? "default"}>
                {rsvp.status}
              </Badge>
            )}
            {isSaved && (
              <span className="text-xs font-medium text-green-600">Saved</span>
            )}
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-400">
          {new Date(rsvp.createdAt).toLocaleDateString()}
        </td>
      </tr>

      {isExpanded && (
        <tr>
          <td colSpan={6} className="bg-gray-50 px-8 py-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Volunteer History
            </p>
            {isLoadingHistory ? (
              <p className="text-sm text-gray-400">Loading history...</p>
            ) : history && history.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    <th className="pb-2 pr-4">Event</th>
                    <th className="pb-2 pr-4">Date</th>
                    <th className="pb-2 pr-4">Role</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((entry) => (
                    <tr key={entry.id}>
                      <td className="py-1.5 pr-4 text-gray-700">{entry.eventTitle}</td>
                      <td className="py-1.5 pr-4 text-gray-500">
                        {new Date(entry.eventDate).toLocaleDateString()}
                      </td>
                      <td className="py-1.5 pr-4 text-gray-500">
                        {entry.roleName || "\u2014"}
                      </td>
                      <td className="py-1.5">
                        <Badge variant={statusBadgeVariant[entry.status] ?? "default"}>
                          {entry.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-400">No other event history found.</p>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
