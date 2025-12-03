import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CalculationCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string; // Added optional className for flexibility
}

export function CalculationCard({
  title,
  description,
  children,
  className,
}: CalculationCardProps) {
  return (
    <Card
      className={cn(
        "transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg bg-blue-500/70",
        /* Probably won't use this, but if I want to override the specific styling (i.e. bg color) 
           I can use this prop */
        className
      )}
    >
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="text-gray-300">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}