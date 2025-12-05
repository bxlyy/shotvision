import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PhaseData {
  detected?: boolean;
  timestamp?: number;
  // Dynamic properties based on the phase type
  shoulder_rotation?: number;
  elbow_angle?: number;
  hip_velocity?: number;
  [key: string]: any; 
}

interface PhaseItemProps {
  name: string;
  data: PhaseData;
}

export function PhaseItem({ name, data }: PhaseItemProps) {
  if (!data?.detected) return null;

  // Helper to determine which metric to highlight based on the phase name
  const getHeroMetric = (phaseName: string, phaseData: PhaseData) => {
    switch (phaseName) {
      case "unit_turn":
        return phaseData.shoulder_rotation 
          ? `${phaseData.shoulder_rotation.toFixed(1)}° rot` 
          : null;
      case "contact":
        return phaseData.elbow_angle 
          ? `${phaseData.elbow_angle.toFixed(1)}° elbow` 
          : null;
      case "forward_swing":
        return phaseData.hip_velocity 
          ? `${phaseData.hip_velocity.toFixed(2)} vel` 
          : null;
      default:
        return null;
    }
  };

  const heroMetric = getHeroMetric(name, data);

  return (
    <div className="flex items-center justify-between rounded px-1 py-2 transition-colors hover:bg-muted/50">
      <div className="flex flex-col">
        <span className="text-sm font-medium capitalize">
          {name.replace(/_/g, " ")}
        </span>
        <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
          <Clock className="h-3 w-3" /> 
          {data.timestamp?.toFixed(2)}s
        </span>
      </div>
      {heroMetric && (
        <Badge variant="secondary" className="font-mono text-xs font-normal">
          {heroMetric}
        </Badge>
      )}
    </div>
  );
}