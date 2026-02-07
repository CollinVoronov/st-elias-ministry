"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, Plus, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

interface IdeaData {
  id: string;
  title: string;
  description: string;
  submitterName: string;
  status: string;
  createdAt: string;
  _count: { votes: number; comments: number };
}

const statusVariant: Record<string, "default" | "info" | "success" | "warning" | "danger"> = {
  SUBMITTED: "default",
  UNDER_REVIEW: "info",
  APPROVED: "success",
  IN_PLANNING: "warning",
  DECLINED: "danger",
};

export function AdminIdeasSection({ initialIdeas }: { initialIdeas: IdeaData[] }) {
  const [ideas, setIdeas] = useState(initialIdeas);

  const updateStatus = async (ideaId: string, status: string) => {
    const res = await fetch(`/api/ideas/${ideaId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      setIdeas((prev) =>
        prev.map((idea) => (idea.id === ideaId ? { ...idea, status } : idea))
      );
    }
  };

  return (
    <div className="mt-12">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-primary-900">Community Ideas</h2>
        <p className="text-sm text-gray-600">
          Review submitted ideas and create events from approved ones.
        </p>
      </div>

      {ideas.length > 0 ? (
        <div className="space-y-3">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-primary-900">
                      {idea.title}
                    </h3>
                    <Badge variant={statusVariant[idea.status]}>
                      {idea.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {idea.description}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                    <span>By {idea.submitterName}</span>
                    <span>{idea._count.votes} votes</span>
                    <span>{idea._count.comments} comments</span>
                    <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-1">
                  {idea.status === "SUBMITTED" && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateStatus(idea.id, "APPROVED")}
                        title="Approve"
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateStatus(idea.id, "DECLINED")}
                        title="Decline"
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </>
                  )}
                  {(idea.status === "APPROVED" || idea.status === "SUBMITTED") && (
                    <Link
                      href={`/admin/events/new?title=${encodeURIComponent(idea.title)}&description=${encodeURIComponent(idea.description)}`}
                    >
                      <Button variant="outline" size="sm" title="Create event from this idea">
                        <Plus className="h-4 w-4" />
                        Event
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Lightbulb}
          title="No ideas submitted"
          description="Ideas will appear here when community members submit them."
        />
      )}
    </div>
  );
}
