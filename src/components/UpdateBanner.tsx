import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Download, RefreshCw, CheckCircle, ExternalLink, Wifi, Bug } from 'lucide-react';
import { updateService, UpdateInfo } from '@/services/updateService';
import { Capacitor } from '@capacitor/core';

interface UpdateBannerProps {
  className?: string;
}

export function UpdateBanner({ className = '' }: UpdateBannerProps) {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Enable automatic update checking
    checkForUpdates();
    
    // Check for updates every 30 minutes
    const interval = setInterval(checkForUpdates, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const checkForUpdates = async () => {
    try {
      // Check all update types
      const [versionUpdate, otaUpdate, generalUpdate] = await Promise.all([
        updateService.checkVersionUpdate(),
        updateService.checkOTAUpdate(),
        updateService.checkForUpdates()
      ]);
      
      // Show update if any are available
      if (versionUpdate.available || otaUpdate.available || generalUpdate.available) {
        const info = versionUpdate.available ? versionUpdate : (otaUpdate.available ? otaUpdate : generalUpdate);
        setUpdateInfo(info);
        setIsVisible(true);
      }
    } catch (error) {
      console.error('[UpdateBanner] Error checking for updates:', error);
    }
  };

  const handleUpdate = async () => {
    if (!updateInfo) return;

    setIsUpdating(true);
    try {
      await updateService.applyUpdate();
      // Update applied successfully
    } catch (error) {
      console.error('[UpdateBanner] Error applying update:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };



  // Show update notification if available
  if (!isVisible || !updateInfo) {
    return null;
  }

  if (!isVisible || !updateInfo) {
    return null;
  }

  return (
    <div className={`fixed top-4 left-4 right-4 z-50 ${className}`}>
      <Card className="shadow-lg border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            {updateInfo.mandatory ? 'App Update Required' : 'Update Available'}
            {updateInfo.version && (
              <Badge variant="secondary" className="ml-2">
                v{updateInfo.version}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {updateInfo.currentVersion && updateInfo.targetVersion && (
              <div className="bg-white/50 p-3 rounded border">
                <p className="text-sm font-medium text-gray-800 mb-2">Version Information:</p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-red-600">Current: v{updateInfo.currentVersion}</span>
                  <span className="text-green-600">Available: v{updateInfo.targetVersion}</span>
                </div>
              </div>
            )}
            
            <p className="text-sm text-gray-700">
              A new version of MarkIt is available with enhanced error handling, better security, and improved user experience. {updateInfo.mandatory ? 'Please update to continue using the app.' : 'You can update now or continue using the current version.'}
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

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDismiss}
            >
              {updateInfo.mandatory ? 'Continue' : 'Later'}
            </Button>
            
            <Button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="bg-orange-600 hover:bg-orange-700 flex-1"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Update Now
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default UpdateBanner; 