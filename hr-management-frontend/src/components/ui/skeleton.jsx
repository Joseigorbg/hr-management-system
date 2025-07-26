import React from "react"
import { cn } from "@/lib/utils"

const Skeleton = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("bg-muted animate-pulse rounded-md", className)}
    {...props}
  />
))
Skeleton.displayName = "Skeleton"

export { Skeleton }