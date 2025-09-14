import * as React from "react"
import { useIsMobile } from "./use-mobile"

interface UseMobilePerformanceOptions {
  enableLazyLoading?: boolean
  enableIntersectionObserver?: boolean
  enableReducedMotion?: boolean
  enableTouchOptimization?: boolean
}

export function useMobilePerformance(options: UseMobilePerformanceOptions = {}) {
  const {
    enableLazyLoading = true,
    enableIntersectionObserver = true,
    enableReducedMotion = true,
    enableTouchOptimization = true,
  } = options

  const isMobile = useIsMobile()
  const [isVisible, setIsVisible] = React.useState(!enableLazyLoading)
  const [shouldReduceMotion, setShouldReduceMotion] = React.useState(false)
  const elementRef = React.useRef<HTMLElement>(null)

  // Check for reduced motion preference
  React.useEffect(() => {
    if (enableReducedMotion) {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
      setShouldReduceMotion(mediaQuery.matches)

      const handleChange = (e: MediaQueryListEvent) => {
        setShouldReduceMotion(e.matches)
      }

      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }
  }, [enableReducedMotion])

  // Intersection Observer for lazy loading
  React.useEffect(() => {
    if (!enableLazyLoading || !enableIntersectionObserver || !elementRef.current) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: isMobile ? "50px" : "100px", // Load earlier on mobile
        threshold: 0.1,
      }
    )

    observer.observe(elementRef.current)

    return () => observer.disconnect()
  }, [enableLazyLoading, enableIntersectionObserver, isMobile])

  // Mobile-specific optimizations
  const mobileOptimizations = React.useMemo(() => {
    if (!isMobile) return {}

    return {
      // Touch optimizations
      touchAction: enableTouchOptimization ? "manipulation" : "auto",
      // Performance optimizations
      contain: "layout style paint",
      // GPU acceleration
      transform: "translateZ(0)",
      willChange: "transform",
    }
  }, [isMobile, enableTouchOptimization])

  // Performance class names
  const performanceClasses = React.useMemo(() => {
    const classes = []
    
    if (isMobile) {
      classes.push("mobile-optimized")
      
      if (enableTouchOptimization) {
        classes.push("touch-optimized")
      }
      
      classes.push("gpu-accelerated")
    }
    
    if (shouldReduceMotion) {
      classes.push("reduce-motion")
    }
    
    return classes.join(" ")
  }, [isMobile, enableTouchOptimization, shouldReduceMotion])

  return {
    isMobile,
    isVisible,
    shouldReduceMotion,
    elementRef,
    mobileOptimizations,
    performanceClasses,
  }
}

// Hook for optimizing images on mobile
export function useMobileImageOptimization() {
  const isMobile = useIsMobile()
  const [imageLoaded, setImageLoaded] = React.useState(false)

  const optimizeImageProps = React.useCallback((src: string, alt: string) => {
    return {
      src,
      alt,
      loading: isMobile ? "lazy" : "eager",
      decoding: "async",
      onLoad: () => setImageLoaded(true),
      style: {
        opacity: imageLoaded ? 1 : 0,
        transition: "opacity 0.3s ease-in-out",
      },
    }
  }, [isMobile, imageLoaded])

  return {
    isMobile,
    imageLoaded,
    optimizeImageProps,
  }
}

// Hook for mobile scroll optimization
export function useMobileScrollOptimization() {
  const isMobile = useIsMobile()
  const [isScrolling, setIsScrolling] = React.useState(false)
  const scrollTimeoutRef = React.useRef<NodeJS.Timeout>()

  const handleScroll = React.useCallback(() => {
    if (!isMobile) return

    setIsScrolling(true)
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false)
    }, 150)
  }, [isMobile])

  React.useEffect(() => {
    if (!isMobile) return

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [isMobile, handleScroll])

  return {
    isMobile,
    isScrolling,
  }
}
