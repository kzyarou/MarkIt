import React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { 
  Home, 
  Search, 
  Plus, 
  Bell, 
  User, 
  LogOut,
  Settings,
  FileText,
  Calculator,
  MessageCircle
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

  // Core navigation items (Instagram-style)
  let coreItems: NavItem[] = [
    { id: "home", label: "Home", icon: Home, path: "/" },
    { id: "search", label: "Search", icon: Search, path: "/search" },
    { id: "create", label: "Create", icon: Plus, path: "/create-harvest" },
    { id: "messages", label: "Messages", icon: MessageCircle, path: "/messages" },
    { id: "notifications", label: "Notifications", icon: Bell, path: "/notifications" },
    { id: "profile", label: "Profile", icon: User, path: "/profile" },
  ]

  // Add role-specific items
  if (user?.role === "farmer" || user?.role === "fisherman") {
    coreItems.splice(2, 0, { id: "mydashboard", label: "My Dashboard", icon: FileText, path: "/mydashboard" })
  } else if (user?.role === "buyer") {
    // Buyers don't need dashboard or create - they only have search and messages
    coreItems = [
      { id: "home", label: "Home", icon: Home, path: "/" },
      { id: "search", label: "Search", icon: Search, path: "/search" },
      { id: "messages", label: "Messages", icon: MessageCircle, path: "/messages" },
      { id: "notifications", label: "Notifications", icon: Bell, path: "/notifications" },
      { id: "profile", label: "Profile", icon: User, path: "/profile" },
    ]
  } else if (user?.role === "admin") {
    coreItems = [
      { id: "admin", label: "Admin", icon: Settings, path: "/admin" },
      { id: "profile", label: "Profile", icon: User, path: "/profile" },
    ]
  }

  return coreItems
}

function SidebarNav() {
  const items = useNavItems()
  const location = useLocation()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = React.useState(0)

  // Mock unread count - in a real app, this would come from Firebase
  React.useEffect(() => {
    // Simulate unread notifications count
    setUnreadCount(3) // This would be fetched from your notifications service
  }, [])

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/" || location.pathname.startsWith("/section")
    }
    return location.pathname === path
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <img 
            src="/markit-logo.svg" 
            alt="MarkIt" 
            className="h-8 w-8 text-green-600"
          />
          <h1 className="text-xl font-bold text-gray-900">MarkIt</h1>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            
            return (
              <motion.button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-3 py-3 rounded-lg text-left transition-colors ${
                  active 
                    ? 'bg-green-50 text-green-700 font-semibold' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative">
                  <Icon className={`h-6 w-6 ${active ? 'text-green-600' : 'text-gray-500'}`} />
                  {item.id === 'notifications' && unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                  )}
                </div>
                <span className="text-sm">{item.label}</span>
              </motion.button>
            )
          })}
        </nav>
      </div>

      {/* Footer with User Profile */}
      <div className="p-3 border-t border-gray-200">
        <UserProfile />
      </div>
    </div>
  )
}

function UserProfile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/auth")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const isProfileActive = location.pathname === "/profile"

  const initialsFromName = (name: string) => {
    if (!name) return "?"
    const parts = name.trim().split(" ")
    const first = parts[0]?.[0] ?? ""
    const last = parts.length > 1 ? parts[parts.length - 1][0] : ""
    return (first + last).toUpperCase()
  }

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
            isProfileActive 
              ? 'bg-green-50 text-green-700 font-semibold' 
              : 'text-gray-700 hover:bg-gray-50'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.profileImage} alt={user.name} />
            <AvatarFallback className="bg-green-100 text-green-700 text-xs">
              {initialsFromName(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">
              {user.role === 'farmer' ? 'Farmer' : 
               user.role === 'fisherman' ? 'Fisherman' : 
               user.role === 'buyer' ? 'Buyer' : 
               user.role === 'admin' ? 'Admin' : 'User'}
            </p>
          </div>
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/profile")}>
          <User className="mr-2 h-4 w-4" />
          View Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


export function AppSidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <SidebarNav />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}