import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Download, RefreshCw, CheckCircle, ExternalLink, Wifi } from 'lucide-react';
import { updateService, UpdateInfo } from '@/services/updateService';
import { Capacitor } from '@capacitor/core';

interface UpdateNotificationProps {
  className?: string;
}

export function UpdateNotification({ className = '' }: UpdateNotificationProps) {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isVersionUpdate, setIsVersionUpdate] = useState(false);
  const [isOTAUpdate, setIsOTAUpdate] = useState(false);

  useEffect(() => {
    // Listen for update availability
    updateService.onUpdateAvailable((info) => {
      setUpdateInfo(info);
      setIsVisible(true);
      setIsVersionUpdate(false);
      setIsOTAUpdate(info.isOTA || false);
    });

    // Listen for update completion
    updateService.onUpdateApplied(() => {
      setIsVisible(false);
      setUpdateInfo(null);
    });

    // Enable automatic update checking
    checkForUpdates();
    checkForVersionUpdate();
    checkForOTAUpdate();

    // Periodic update checks every 30 minutes
    const interval = setInterval(() => {
      checkForUpdates();
      checkForVersionUpdate();
      checkForOTAUpdate();
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const checkForUpdates = async () => {
    try {
      const info = await updateService.checkForUpdates();
      if (info.available) {
        setUpdateInfo(info);
        setIsVisible(true);
        setIsVersionUpdate(false);
        setIsOTAUpdate(info.isOTA || false);
      }
    } catch (error) {
      console.error('[UpdateNotification] Error checking for updates:', error);
    }
  };

  const checkForVersionUpdate = async () => {
    try {
      const info = await updateService.checkVersionUpdate();
      if (info.available) {
        setUpdateInfo(info);
        setIsVisible(true);
        setIsVersionUpdate(true);
        setIsOTAUpdate(false);
      }
    } catch (error) {
      console.error('[UpdateNotification] Error checking for version update:', error);
    }
  };

  const checkForOTAUpdate = async () => {
    try {
      const info = await updateService.checkOTAUpdate();
      if (info.available) {
        setUpdateInfo(info);
        setIsVisible(true);
        setIsVersionUpdate(false);
        setIsOTAUpdate(true);
      }
    } catch (error) {
      console.error('[UpdateNotification] Error checking for OTA update:', error);
    }
  };

  const handleUpdate = async () => {
    if (!updateInfo) return;

    if (isVersionUpdate) {
      // For version updates, redirect to download or show instructions
      handleVersionUpdate();
      return;
    }

    if (isOTAUpdate) {
      // For OTA updates, apply automatically
      await handleOTAUpdate();
      return;
    }

    setIsUpdating(true);
    try {
      await updateService.applyUpdate();
      // The update service will handle the reload/restart
    } catch (error) {
      console.error('[UpdateNotification] Error applying update:', error);
      setIsUpdating(false);
    }
  };

  const handleVersionUpdate = () => {
    // For mobile apps, show instructions to download new APK
    if (Capacitor.isNativePlatform()) {
      // You can customize this message or redirect to a download page
      alert('Please download and install the latest MarkIt APK from your administrator or app store.');
    } else {
      // For web, reload to get latest version
      window.location.reload();
    }
  };

  const handleOTAUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateService.applyUpdate();
      // The update service will handle the restart
    } catch (error) {
      console.error('[UpdateNotification] Error applying OTA update:', error);
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
      <Card className={`shadow-lg border-2 ${
        isOTAUpdate 
          ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50' 
          : 'border-orange-200 bg-gradient-to-r from-orange-50 to-red-50'
      }`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            {isOTAUpdate ? (
              <Wifi className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-orange-600" />
            )}
            {isOTAUpdate 
              ? 'Automatic Update Available' 
              : (isVersionUpdate 
                ? (updateInfo.mandatory ? 'App Update Required' : 'App Update Available')
                : (isMandatory ? 'Update Required' : 'Update Available')
              )
            }
            {updateInfo.version && (
              <Badge variant="secondary" className="ml-2">
                v{updateInfo.version}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {isVersionUpdate && updateInfo.currentVersion && updateInfo.targetVersion && (
              <div className="bg-white/50 p-3 rounded border">
                <p className="text-sm font-medium text-gray-800 mb-2">Version Information:</p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-red-600">Current: v{updateInfo.currentVersion}</span>
                  <span className="text-green-600">Available: v{updateInfo.targetVersion}</span>
                </div>
              </div>
            )}
            
            <p className="text-sm text-gray-700">
              {isOTAUpdate 
                ? 'A new update is available and will be installed automatically. The app will restart to apply the update.'
                : (isVersionUpdate 
                  ? (updateInfo.mandatory 
                    ? 'A new version of MarkIt is available with important bug fixes and improvements. Please update to continue using the app.'
                    : 'A new version of MarkIt is available with important bug fixes and improvements. You can update now or continue using the current version.'
                  )
                  : (isMandatory 
                    ? 'A mandatory update is required to continue using the app.'
                    : 'A new version of the app is available with improvements and bug fixes.'
                  )
                )
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
            {(!isMandatory || (isVersionUpdate && !updateInfo.mandatory)) && !isOTAUpdate && (
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
              className={`flex-1 sm:flex-none ${
                isOTAUpdate 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {isOTAUpdate ? 'Installing...' : (isMobile ? 'Installing...' : 'Updating...')}
                </>
              ) : (
                <>
                  {isOTAUpdate ? (
                    <>
                      <Wifi className="w-4 h-4 mr-2" />
                      Install Update
                    </>
                  ) : (isVersionUpdate ? (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {isMobile ? 'Download Update' : (updateInfo.mandatory ? 'Get Update' : 'Update Now')}
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
                  ))}
                </>
              )}
            </Button>
          </div>

          {isMobile && isVersionUpdate && (
            <p className="text-xs text-gray-500 text-center">
              {updateInfo.mandatory 
                ? 'Please download and install the latest APK file to update the app.'
                : 'You can download and install the latest APK file to update the app, or continue using the current version.'
              }
            </p>
          )}

          {isMobile && isOTAUpdate && (
            <p className="text-xs text-gray-500 text-center">
              The update will be downloaded and installed automatically. The app will restart after installation.
            </p>
          )}

          {isMobile && !isVersionUpdate && !isOTAUpdate && (
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