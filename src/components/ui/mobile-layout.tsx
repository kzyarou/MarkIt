import * as React from "react"
import { cn } from "@/lib/utils"
import { useIsMobile, useDeviceType } from "@/hooks/use-mobile"
import { useMobilePerformance } from "@/hooks/use-mobile-performance"

interface MobileLayoutProps {
  children: React.ReactNode
  className?: string
  enablePerformanceOptimizations?: boolean
  enableSafeArea?: boolean
  spacing?: "none" | "sm" | "md" | "lg"
  padding?: "none" | "sm" | "md" | "lg"
}

export function MobileLayout({
  children,
  className,
  enablePerformanceOptimizations = true,
  enableSafeArea = true,
  spacing = "md",
  padding = "md",
}: MobileLayoutProps) {
  const isMobile = useIsMobile()
  const deviceType = useDeviceType()
  
  const { performanceClasses } = useMobilePerformance({
    enableLazyLoading: enablePerformanceOptimizations,
    enableIntersectionObserver: enablePerformanceOptimizations,
    enableReducedMotion: enablePerformanceOptimizations,
    enableTouchOptimization: enablePerformanceOptimizations,
  })

  const spacingClasses = {
    none: "",
    sm: "space-y-2 sm:space-y-4",
    md: "space-y-4 sm:space-y-6",
    lg: "space-y-6 sm:space-y-8",
  }

  const paddingClasses = {
    none: "",
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-6",
    lg: "p-6 sm:p-8",
  }

  const layoutClasses = cn(
    // Base layout
    "min-h-screen",
    // Mobile viewport optimization
    isMobile && "mobile-viewport",
    // Safe area handling
    enableSafeArea && isMobile && "pb-safe-nav",
    // Spacing and padding
    spacingClasses[spacing],
    paddingClasses[padding],
    // Performance optimizations
    enablePerformanceOptimizations && performanceClasses,
    // Device-specific classes
    deviceType && `device-${deviceType}`,
    className
  )

  return <div className={layoutClasses}>{children}</div>
}

interface MobilePageProps {
  children: React.ReactNode
  className?: string
  title?: string
  showBackButton?: boolean
  onBack?: () => void
}

export function MobilePage({
  children,
  className,
  title,
  showBackButton = false,
  onBack,
}: MobilePageProps) {
  const isMobile = useIsMobile()

  const pageClasses = cn(
    "mobile-page",
    isMobile && "mobile-optimized",
    className
  )

  return (
    <div className={pageClasses}>
      {(title || showBackButton) && (
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center gap-4 p-4">
            {showBackButton && (
              <button
                onClick={onBack}
                className="touch-target p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Go back"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
            {title && (
              <h1 className="mobile-text-lg font-semibold truncate">{title}</h1>
            )}
          </div>
        </div>
      )}
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}

interface MobileSectionProps {
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
  spacing?: "sm" | "md" | "lg"
}

export function MobileSection({
  children,
  className,
  title,
  description,
  spacing = "md",
}: MobileSectionProps) {
  const spacingClasses = {
    sm: "space-y-3",
    md: "space-y-4",
    lg: "space-y-6",
  }

  const sectionClasses = cn(
    "mobile-optimized",
    spacingClasses[spacing],
    className
  )

  return (
    <section className={sectionClasses}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h2 className="mobile-text-base font-semibold">{title}</h2>
          )}
          {description && (
            <p className="mobile-text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  )
}
