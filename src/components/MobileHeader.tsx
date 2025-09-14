import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, Menu, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export function MobileHeader() {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Base menu items for all users
  const menuItems = [
    { label: 'Profile', href: '/profile' },
    { label: 'Settings', href: '/settings' },
  ];

  // Add role-specific items
  if (user?.role === 'farmer' || user?.role === 'fisherman') {
    // Seller (farmer/fisherman) menu items
    menuItems.unshift(
      { label: 'Notifications', href: '/notifications' },
      { label: 'Search', href: '/search' }
    );
  } else if (user?.role === 'buyer') {
    // Buyer menu items
    menuItems.unshift(
      { label: 'Notifications', href: '/notifications' },
      { label: 'Search', href: '/search' }
    );
  } else if (user?.role === 'student') {
    // Student menu items
    menuItems.unshift(
      { label: 'Notifications', href: '/notifications' },
      { label: 'Search', href: '/search' },
      { label: 'Create Harvest', href: '/create-harvest' }
    );
    menuItems.push({ label: 'Calculator', href: '/calculator' });
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-green-200">
      <div className="flex items-center justify-between px-4 py-3">
        {/* MarkIt Logo/Brand */}
        <div className="flex items-center space-x-2">
          <img 
            src="/markit-logo.svg" 
            alt="MarkIt" 
            className="h-6 w-6 text-green-600"
          />
          <h1 className="text-lg font-bold text-green-700">MarkIt</h1>
        </div>

        {/* Right side with Location Badge and Menu */}
        <div className="flex items-center space-x-2">
          {/* Location Badge */}
          <Badge 
            variant="outline" 
            className="bg-green-50 border-green-300 text-green-700 px-2 sm:px-3 py-1 text-xs hidden sm:flex"
          >
            <MapPin className="h-3 w-3 mr-1" />
            <span className="truncate max-w-[100px]">{user?.location?.city || 'Location'}</span>
          </Badge>

          {/* Hamburger Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="h-5 w-5 text-green-700" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-2">
                {menuItems.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className="w-full justify-start h-12 text-left"
                    onClick={() => {
                      window.location.href = item.href;
                      setIsMenuOpen(false);
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}

