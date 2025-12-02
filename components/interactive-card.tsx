import * as React from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const InteractiveCard = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Card>
>(({ className, ...props }, ref) => (
  <Card
    ref={ref}
    className={cn(
      // The animation styles are now isolated here
      "transition-all duration-300 ease-in-out hover:-rotate-1 hover:scale-[1.02] hover:shadow-lg",
      className
    )}
    {...props}
  />
))

InteractiveCard.displayName = "InteractiveCard"

export { InteractiveCard }