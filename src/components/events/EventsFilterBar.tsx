"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/Select";

interface Ministry {
  id: string;
  name: string;
}

interface EventsFilterBarProps {
  ministries: Ministry[];
}

export function EventsFilterBar({ ministries }: EventsFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentMinistry = searchParams.get("ministry") || "";

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("ministry", value);
    } else {
      params.delete("ministry");
    }
    router.push(`/admin/events?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3">
      <Select
        id="ministry-filter"
        options={ministries.map((m) => ({ value: m.id, label: m.name }))}
        placeholder="All Ministries"
        value={currentMinistry}
        onChange={handleFilterChange}
      />
    </div>
  );
}
