import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  dark?: boolean;
  className?: string;
}

function StatsCard({ title, value, description, icon: Icon, dark, className }: StatsCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-6 shadow-sm",
        dark
          ? "border-primary-700 bg-primary-800"
          : "border-gray-200 bg-white",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className={cn("text-sm font-medium", dark ? "text-primary-300" : "text-gray-600")}>
          {title}
        </p>
        {Icon && (
          <Icon className={cn("h-5 w-5", dark ? "text-accent-400" : "text-gray-400")} />
        )}
      </div>
      <p
        className={cn(
          "mt-2 text-3xl font-bold tracking-tight",
          dark ? "text-white" : "text-primary-900"
        )}
      >
        {value}
      </p>
      {description && (
        <p className={cn("mt-1 text-sm", dark ? "text-primary-300" : "text-gray-600")}>
          {description}
        </p>
      )}
    </div>
  );
}

export { StatsCard };
