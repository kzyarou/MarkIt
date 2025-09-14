import * as React from "react"
import { useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px) and (max-width: ${TABLET_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsTablet(window.innerWidth >= MOBILE_BREAKPOINT && window.innerWidth < TABLET_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsTablet(window.innerWidth >= MOBILE_BREAKPOINT && window.innerWidth < TABLET_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isTablet
}

export function useDeviceType() {
  const [deviceType, setDeviceType] = React.useState<'mobile' | 'tablet' | 'desktop' | undefined>(undefined)

  React.useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth
      if (width < MOBILE_BREAKPOINT) {
        setDeviceType('mobile')
      } else if (width < TABLET_BREAKPOINT) {
        setDeviceType('tablet')
      } else {
        setDeviceType('desktop')
      }
    }

    checkDeviceType()
    window.addEventListener("resize", checkDeviceType)

    return () => window.removeEventListener("resize", checkDeviceType)
  }, [])

  return deviceType
}

export function useBottomNav() {
  const { user } = useAuth()
  const location = useLocation()
  const isMobile = useIsMobile()

  const isAuthedArea = Boolean(user) && !['/auth', '/onboarding'].includes(location.pathname)
  const showBottomNav = isAuthedArea && isMobile

  // Debug logging
  console.log('[useBottomNav]', {
    userRole: user?.role,
    location: location.pathname,
    isMobile,
    isAuthedArea,
    showBottomNav
  })

  return {
    showBottomNav,
    isMobile,
    bottomNavClass: showBottomNav ? 'pb-safe-nav' : ''
  }
}
