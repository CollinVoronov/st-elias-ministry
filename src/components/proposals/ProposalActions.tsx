"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ProposalActions({ proposalId }: { proposalId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "decline" | null>(null);

  const handleAction = async (action: "approve" | "decline") => {
    if (!window.confirm(
      action === "approve"
        ? "Approve this proposal? It will be published to the public calendar."
        : "Decline this proposal? The submitter will see it as declined."
    )) return;

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
