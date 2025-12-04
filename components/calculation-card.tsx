import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Defined Interface acts as a "Contract" for usage
interface CalculationCardProps {
  /** The primary metric or category name (e.g., "Phases", "Engine") */
  title: string;
  /** A brief explanation of the metric to guide the user context */
  description: string;
  /** The actual data visualization or text to render inside the card */
  children: React.ReactNode;
  /** Optional class overrides for specific styling needs */
  className?: string;
}

/**
 * CalculationCard
 * * A reusable UI component designed for the ShotVision dashboard.
 * It encapsulates the specific hover animations and "blue-glass" aesthetic 
 * used for displaying ML-generated tennis swing statistics.
 * * Use this instead of the raw Shadcn Card to ensure visual consistency
 * across the dashboard grid.
 */
export function CalculationCard({
  title,
  description,
  children,
  className,
}: CalculationCardProps) {
  return (
    <Card
      // Merging default styles with the 'className' prop ensures flexibility
      // while maintaining the base "glassmorphism" look.
      className={cn(
        "transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg bg-blue-500/70",
        className
      )}
    >
      {/* Title and description of the calculation */}
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="text-gray-300">
          {description}
        </CardDescription>
      </CardHeader>
      {/* Main content of the calculation */}
      <CardContent>{children}</CardContent>
    </Card>
  );
}