import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  className?: string;
}

function StatsCard({ title, value, description, icon: Icon, className }: StatsCardProps) {
  return (
    <div className={cn("rounded-xl border border-gray-200 bg-white p-6 shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {Icon && <Icon className="h-5 w-5 text-gray-400" />}
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight text-primary-900">{value}</p>
      {description && (
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      )}
    </div>
  );
}

export { StatsCard };
