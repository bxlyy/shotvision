import { type LucideIcon } from "lucide-react";

interface StatRowProps {
  label: string;
  value: number | string | undefined;
  unit?: string;
  icon?: LucideIcon;
}

export function StatRow({ label, value, unit = "", icon: Icon }: StatRowProps) {
  // If value is missing/undefined, you might want to render nothing or a placeholder.
  // Currently rendering standard "0" or empty if null, or just passing through.
  if (value === undefined || value === null) return null;

  return (
    <div className="flex items-center justify-between border-b border-border/50 py-2 last:border-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {Icon && <Icon className="h-4 w-4" />}
        <span>{label}</span>
      </div>
      <span className="font-mono text-sm font-medium">
        {typeof value === "number" ? value.toFixed(1) : value}
        <span className="ml-0.5 text-xs text-muted-foreground">{unit}</span>
      </span>
    </div>
  );
}