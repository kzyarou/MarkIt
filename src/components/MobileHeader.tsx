import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function MobileHeader() {
  const { user } = useAuth();

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

        {/* Location Badge */}
        <Badge 
          variant="outline" 
          className="bg-green-50 border-green-300 text-green-700 px-3 py-1 text-xs"
        >
          <MapPin className="h-3 w-3 mr-1" />
          <span>{user?.location?.city || 'Location'}</span>
        </Badge>
      </div>
    </div>
  );
}

