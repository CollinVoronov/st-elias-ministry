"use client";

import { useState, useEffect } from "react";
import { Lightbulb, Check, X, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface IdeaData {
  id: string;
  title: string;
  description: string;
  submitterName: string;
  submitterEmail: string;
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

export function IdeasSection({ isAdmin }: { isAdmin: boolean }) {
  const [ideas, setIdeas] = useState<IdeaData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ideas")
      .then((res) => res.json())
      .then((data) => {
        setIdeas(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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

  if (loading) {
    return (
      <div className="mt-2 text-center text-sm text-gray-400">Loading ideas...</div>
    );
  }

  if (ideas.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white py-8 text-center">
        <Lightbulb className="mx-auto h-8 w-8 text-gray-300" />
        <p className="mt-2 text-sm text-gray-500">No ideas submitted yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {ideas.map((idea) => (
        <div
          key={idea.id}
          className="rounded-xl border border-gray-200 bg-white p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-primary-900">{idea.title}</h3>
                <Badge variant={statusVariant[idea.status]}>
                  {idea.status.replace("_", " ")}
                </Badge>
              </div>
              {idea.description && (
                <p className="mt-1.5 text-sm text-gray-600 line-clamp-2">
                  {idea.description}
                </p>
              )}
              <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                <span>By {idea.submitterName}</span>
                <span>{idea._count.votes} votes</span>
                <span>{idea._count.comments} comments</span>
                <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {isAdmin && (
              <div className="flex flex-shrink-0 gap-2">
                {idea.status === "SUBMITTED" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatus(idea.id, "APPROVED")}
                      className="border-green-300 text-green-700 hover:bg-green-50"
                      title="Approve"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatus(idea.id, "DECLINED")}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      title="Decline"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
                {(idea.status === "APPROVED" || idea.status === "DECLINED") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatus(idea.id, "SUBMITTED")}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    title="Revert"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
