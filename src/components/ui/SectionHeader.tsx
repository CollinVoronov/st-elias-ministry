import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  description?: string;
  className?: string;
  action?: React.ReactNode;
}

function SectionHeader({ title, description, className, action }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between", className)}>
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-primary-900">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export { SectionHeader };
