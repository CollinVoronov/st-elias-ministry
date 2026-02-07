"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ProposalActionsProps {
  proposalId: string;
  status?: string;
}

export function ProposalActions({ proposalId, status = "DRAFT" }: ProposalActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (action: "approve" | "decline" | "revert") => {
    const messages: Record<string, string> = {
      approve: "Approve this proposal? It will be published to the public calendar.",
      decline: "Decline this proposal? The submitter will see it as declined.",
      revert: "Revert this proposal to pending review?",
    };

    if (!window.confirm(messages[action])) return;

    setLoading(action);
    try {
      const res = await fetch(`/api/proposals/${proposalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to update proposal.");
      }
    } catch {
      alert("Something went wrong.");
    }
    setLoading(null);
  };

  if (status === "DRAFT") {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAction("approve")}
          disabled={loading !== null}
          className="border-green-300 text-green-700 hover:bg-green-50"
        >
          <Check className="h-4 w-4" />
          {loading === "approve" ? "Approving..." : "Approve"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAction("decline")}
          disabled={loading !== null}
          className="border-red-300 text-red-600 hover:bg-red-50"
        >
          <X className="h-4 w-4" />
          {loading === "decline" ? "Declining..." : "Decline"}
        </Button>
      </div>
    );
  }

  // For PUBLISHED or CANCELLED — show revert button
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => handleAction("revert")}
      disabled={loading !== null}
      className="border-gray-300 text-gray-700 hover:bg-gray-50"
    >
      <RotateCcw className="h-4 w-4" />
      {loading === "revert" ? "Reverting..." : "Revert to Pending"}
    </Button>
  );
}
