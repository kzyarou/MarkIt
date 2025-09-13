import React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Users, FileText, Search, User, Settings, Calculator } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"

function useNavItems(role?: string | null) {
  const base = [
    { id: "homepage", label: "Homepage", icon: Users, path: "/" },
    { id: "mydashboard", label: "MyDashboard", icon: FileText, path: "/mydashboard" },
    { id: "search", label: "Search", icon: Search, path: "/search" },
    { id: "profile", label: "Profile", icon: User, path: "/profile" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
  ] as const

  if (role === "student") {
    return [
      { id: "homepage", label: "Homepage", icon: Users, path: "/" },
      { id: "mydashboard", label: "MyDashboard", icon: FileText, path: "/mydashboard" },
      { id: "calculator", label: "Calculator", icon: Calculator, path: "/calculator" },
      { id: "profile", label: "Profile", icon: User, path: "/profile" },
      { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
    ] as const
  }

  if (role === 'admin') {
    return [
      { id: 'admin', label: 'Admin', icon: Settings, path: '/admin' },
      { id: 'search', label: 'Search', icon: Search, path: '/search' },
      { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
      { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
    ] as const
  }

  return base
}

export default function DesktopSidebar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const items = useNavItems(user?.role)

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/" || location.pathname.startsWith("/section")
    }
    return location.pathname === path
  }

  return (
    <>
      <SidebarHeader className="relative overflow-hidden px-3 py-4">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20" />
        
        <motion.div 
          className="relative flex items-center gap-3 px-1"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Enhanced logo with animation */}
          <motion.div
            className="relative"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="relative">
              <img 
                src="/school-badge.png" 
                alt="MarkIt" 
                className="h-8 w-8 rounded-lg shadow-lg ring-2 ring-white/20 dark:ring-gray-800/20" 
              />
              {/* Glowing effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400 to-purple-400 opacity-20 blur-sm" />
            </div>
          </motion.div>
          
          {/* Enhanced MarkIt text */}
          <motion.div 
            className="flex flex-col"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              MarkIt
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              Education Management
            </div>
          </motion.div>
        </motion.div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="px-2">
              <AnimatePresence>
                {items.map((item, index) => {
                  const Icon = item.icon
                  const active = isActive(item.path)
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        delay: 0.3 + (index * 0.1), 
                        duration: 0.4,
                        ease: "easeOut"
                      }}
                    >
                      <SidebarMenuItem>
                        <motion.div
                          whileHover={{ 
                            scale: 1.02,
                            x: 4,
                            transition: { type: "spring", stiffness: 400, damping: 25 }
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <SidebarMenuButton
                            isActive={active}
                            onClick={() => navigate(item.path)}
                            className={`
                              relative overflow-hidden group transition-all duration-200
                              ${active 
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25' 
                                : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/30 dark:hover:to-purple-950/30'
                              }
                            `}
                          >
                            {/* Active indicator */}
                            {active && (
                              <motion.div
                                className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"
                                layoutId="activeIndicator"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                              />
                            )}
                            
                            {/* Icon with enhanced styling */}
                            <motion.div
                              className="relative"
                              animate={{ 
                                scale: active ? 1.1 : 1
                              }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                              <Icon className={`size-5 ${active ? 'text-white' : 'text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} />
                            </motion.div>
                            
                            {/* Label with enhanced styling */}
                            <motion.span 
                              className={`text-[15px] font-medium transition-colors duration-200 ${
                                active 
                                  ? 'text-white' 
                                  : 'text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400'
                              }`}
                            >
                              {item.label}
                            </motion.span>
                            
                            {/* Hover effect overlay */}
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              initial={false}
                            />
                          </SidebarMenuButton>
                        </motion.div>
                      </SidebarMenuItem>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </>
  )
} 