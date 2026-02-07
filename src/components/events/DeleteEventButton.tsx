"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this event? This cannot be undone.")) {
      return;
    }

    setDeleting(true);
    const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/events");
      router.refresh();
    } else {
      setDeleting(false);
      alert("Failed to delete event.");
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={deleting}
      className="border-red-300 text-red-600 hover:bg-red-50"
    >
      <Trash2 className="h-4 w-4" />
      {deleting ? "Deleting..." : "Delete"}
    </Button>
  );
}
