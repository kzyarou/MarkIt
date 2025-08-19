import React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Users, FileText, Search, User, Settings, Calculator, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  SidebarInput,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type NavItem = {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
}

function useNavItems() {
  const { user } = useAuth()

  let items: NavItem[] = [
    { id: "sections", label: "Sections", icon: Users, path: "/" },
    { id: "reports", label: "Reports", icon: FileText, path: "/reports" },
    { id: "search", label: "Search", icon: Search, path: "/search" },
    { id: "profile", label: "Profile", icon: User, path: "/profile" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
  ]

  if (user?.role === "student") {
    items = [
      { id: "sections", label: "Sections", icon: Users, path: "/" },
      { id: "calculator", label: "Calculator", icon: Calculator, path: "/calculator" },
      { id: "profile", label: "Profile", icon: User, path: "/profile" },
      { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
    ]
  }

  if (user?.role === 'admin') {
    // Admin: keep Admin, hide Sections and Reports top-level
    items = [
      { id: 'admin', label: 'Admin', icon: Settings, path: '/admin' },
      { id: 'search', label: 'Search', icon: Search, path: '/search' },
      { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
      { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
    ]
  }

  return items
}

function SidebarNav() {
  const items = useNavItems()
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/" || location.pathname.startsWith("/section")
    }
    return location.pathname === path
  }

  const [searchText, setSearchText] = React.useState("")

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      navigate("/search")
    }
  }

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <img src="/school-badge.png" alt="EducHub" className="size-7 rounded" />
          <div className="text-base font-semibold tracking-tight">EducHub</div>
        </div>
        <div className="px-2">
          <SidebarInput
            className="h-10"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={onSearchKeyDown}
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[13px]">Navigate</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      size="lg"
                      onClick={() => navigate(item.path)}
                      isActive={active}
                      tooltip={item.label}
                    >
                      <Icon className="size-5" />
                      <span className="text-[15px]">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <UserFooter />
      </SidebarFooter>
      <SidebarRail />
    </>
  )
}

function initialsFromName(name?: string) {
  if (!name) return "?"
  const parts = name.trim().split(" ")
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ""
  return (first + last).toUpperCase()
}

function UserFooter() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const name = user?.name || "User"
  const email = user?.email || ""
  const role = user?.role || "student"
  const avatarUrl = user?.avatarUrl

  const fallbackText = role === 'admin' ? 'DEV' : initialsFromName(name)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-full flex items-center gap-3 rounded-md p-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <Avatar className="size-9">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={name} />
            ) : (
              <AvatarFallback className={role === 'admin' ? 'bg-red-600 text-white' : ''}>{fallbackText}</AvatarFallback>
            )}
          </Avatar>
          <div className="min-w-0 text-left group-data-[collapsible=icon]:hidden">
            <div className="truncate text-sm font-medium leading-5">{name}</div>
            <div className="truncate text-xs text-muted-foreground">{email}</div>
          </div>
          <Badge variant={role === 'admin' ? 'destructive' : 'secondary'} className="ml-auto group-data-[collapsible=icon]:hidden capitalize">
            {role === 'teacher' ? 'developer' : role}
          </Badge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="w-56">
        <DropdownMenuLabel className="text-xs">
          Signed in as
          <div className="font-medium text-foreground text-sm truncate">{name}</div>
          <div className="text-muted-foreground truncate">{email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate("/profile")}>Profile</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate("/settings")}>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => logout()} className="text-destructive">
          <LogOut className="mr-2 size-4" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AppSidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={{
        // Wider sidebar like Classroom
        "--sidebar-width": "20rem",
        "--sidebar-width-icon": "4rem",
      } as React.CSSProperties}
      defaultOpen
    >
      <Sidebar>{<SidebarNav />}</Sidebar>
      <SidebarInset>
        <div className="flex items-center gap-2 p-2 border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/50">
          <SidebarTrigger />
          <div className="text-sm text-muted-foreground">Menu</div>
        </div>
        <div className="text-[15px] md:text-[16px] leading-[1.7]">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 