import * as React from "react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

interface MobileOptimizedProps {
  children: React.ReactNode
  className?: string
  enableGPUAcceleration?: boolean
  enableTouchOptimization?: boolean
  enableSmoothScroll?: boolean
}

export function MobileOptimized({
  children,
  className,
  enableGPUAcceleration = true,
  enableTouchOptimization = true,
  enableSmoothScroll = false,
}: MobileOptimizedProps) {
  const isMobile = useIsMobile()

  const optimizedClasses = cn(
    // Base classes
    className,
    // Mobile-specific optimizations
    isMobile && [
      "mobile-optimized",
      enableTouchOptimization && "touch-optimized",
      enableGPUAcceleration && "gpu-accelerated",
      enableSmoothScroll && "smooth-scroll",
    ]
  )

  return <div className={optimizedClasses}>{children}</div>
}

interface MobileViewportProps {
  children: React.ReactNode
  className?: string
  enableSafeArea?: boolean
}

export function MobileViewport({
  children,
  className,
  enableSafeArea = true,
}: MobileViewportProps) {
  const isMobile = useIsMobile()

  const viewportClasses = cn(
    "mobile-viewport",
    enableSafeArea && isMobile && "pb-safe-nav",
    className
  )

  return <div className={viewportClasses}>{children}</div>
}

interface MobileContainerProps {
  children: React.ReactNode
  className?: string
  spacing?: "sm" | "md" | "lg"
  padding?: "sm" | "md" | "lg"
}

export function MobileContainer({
  children,
  className,
  spacing = "md",
  padding = "md",
}: MobileContainerProps) {
  const spacingClasses = {
    sm: "space-y-2 sm:space-y-4",
    md: "space-y-4 sm:space-y-6",
    lg: "space-y-6 sm:space-y-8",
  }

  const paddingClasses = {
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-6",
    lg: "p-6 sm:p-8",
  }

  const containerClasses = cn(
    spacingClasses[spacing],
    paddingClasses[padding],
    "mobile-optimized",
    className
  )

  return <div className={containerClasses}>{children}</div>
}
