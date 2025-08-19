import * as React from "react"
import { useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

const MOBILE_BREAKPOINT = 768

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
