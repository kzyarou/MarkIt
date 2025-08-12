import React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Users, FileText, Search, User, Settings, Calculator } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
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
    { id: "sections", label: "Sections", icon: Users, path: "/" },
    { id: "reports", label: "Reports", icon: FileText, path: "/reports" },
    { id: "search", label: "Search", icon: Search, path: "/search" },
    { id: "profile", label: "Profile", icon: User, path: "/profile" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
  ] as const

  if (role === "student") {
    return [
      { id: "sections", label: "Sections", icon: Users, path: "/" },
      { id: "calculator", label: "Calculator", icon: Calculator, path: "/calculator" },
      { id: "profile", label: "Profile", icon: User, path: "/profile" },
      { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
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
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-2 px-1">
          <img src="/school-badge.png" alt="EducHub" className="h-7 w-7" />
          <span className="text-base font-semibold">EducHub</span>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={isActive(item.path)}
                      onClick={() => navigate(item.path)}
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </>
  )
} 