// Mobile optimization components and utilities
export { MobileOptimized, MobileViewport, MobileContainer } from "../mobile-optimized"
export { MobileLayout, MobilePage, MobileSection } from "../mobile-layout"

// Re-export mobile hooks for convenience
export { useIsMobile, useIsTablet, useDeviceType, useBottomNav } from "@/hooks/use-mobile"
export { 
  useMobilePerformance, 
  useMobileImageOptimization, 
  useMobileScrollOptimization 
} from "@/hooks/use-mobile-performance"
