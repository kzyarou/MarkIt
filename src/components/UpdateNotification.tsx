import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Download, RefreshCw, CheckCircle } from 'lucide-react';
import { updateService, UpdateInfo } from '@/services/updateService';
import { Capacitor } from '@capacitor/core';

interface UpdateNotificationProps {
  className?: string;
}

export function UpdateNotification({ className = '' }: UpdateNotificationProps) {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Listen for update availability
    updateService.onUpdateAvailable((info) => {
      setUpdateInfo(info);
      setIsVisible(true);
    });

    // Listen for update completion
    updateService.onUpdateApplied(() => {
      setIsVisible(false);
      setUpdateInfo(null);
    });

    // Check for updates on mount
    checkForUpdates();

    // Set up periodic update checks (every 30 minutes)
    const interval = setInterval(checkForUpdates, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const checkForUpdates = async () => {
    try {
      const info = await updateService.checkForUpdates();
      if (info.available) {
        setUpdateInfo(info);
        setIsVisible(true);
      }
    } catch (error) {
      console.error('[UpdateNotification] Error checking for updates:', error);
    }
  };

  const handleUpdate = async () => {
    if (!updateInfo) return;

    setIsUpdating(true);
    try {
      await updateService.applyUpdate();
      // The update service will handle the reload/restart
    } catch (error) {
      console.error('[UpdateNotification] Error applying update:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible || !updateInfo) {
    return null;
  }

  const isMobile = Capacitor.isNativePlatform();
  const isMandatory = updateInfo.mandatory;

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-50 ${className}`}>
      <Card className="shadow-lg border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            {isMandatory ? 'Update Required' : 'Update Available'}
            {updateInfo.version && (
              <Badge variant="secondary" className="ml-2">
                v{updateInfo.version}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              {isMandatory 
                ? 'A mandatory update is required to continue using the app.'
                : 'A new version of the app is available with improvements and bug fixes.'
              }
            </p>
            
            {updateInfo.description && (
              <p className="text-xs text-gray-600 bg-white/50 p-2 rounded">
                {updateInfo.description}
              </p>
            )}
            
            {updateInfo.packageSize && (
              <p className="text-xs text-gray-500">
                Package size: {(updateInfo.packageSize / 1024 / 1024).toFixed(1)} MB
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {!isMandatory && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDismiss}
                className="flex-1 sm:flex-none"
              >
                Later
              </Button>
            )}
            
            <Button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {isMobile ? 'Installing...' : 'Updating...'}
                </>
              ) : (
                <>
                  {isMobile ? (
                    <Download className="w-4 h-4 mr-2" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  {isMobile ? 'Install Update' : 'Update Now'}
                </>
              )}
            </Button>
          </div>

          {isMobile && (
            <p className="text-xs text-gray-500 text-center">
              The app will restart automatically after the update is installed.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default UpdateNotification; 