"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Lightbulb, Check, X, Plus } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

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

export default function AdminIdeasPage() {
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
      <Container>
        <SectionHeader title="Manage Ideas" />
        <div className="mt-6 text-center text-sm text-gray-400">Loading...</div>
      </Container>
    );
  }

  return (
    <Container>
      <SectionHeader
        title="Manage Ideas"
        description="Review community service ideas submitted by members."
        action={
          <Link href="/admin/ideas/new">
            <Button>
              <Plus className="h-4 w-4" />
              New Idea
            </Button>
          </Link>
        }
      />

      {ideas.length > 0 ? (
        <div className="mt-6 space-y-4">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className="rounded-xl border border-gray-200 bg-white p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-primary-900">
                      {idea.title}
                    </h3>
                    <Badge variant={statusVariant[idea.status]}>
                      {idea.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {idea.description}
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                    <span>By {idea.submitterName}</span>
                    <span>{idea._count.votes} votes</span>
                    <span>{idea._count.comments} comments</span>
                    <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {idea.status === "SUBMITTED" && (
                  <div className="flex gap-2">
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
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            icon={Lightbulb}
            title="No ideas submitted"
            description="Ideas will appear here when community members submit them."
          />
        </div>
      )}
    </Container>
  );
}
