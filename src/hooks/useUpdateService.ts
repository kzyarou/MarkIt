import { useState, useEffect, useCallback } from 'react';
import { updateService, UpdateInfo } from '@/services/updateService';
import { Capacitor } from '@capacitor/core';

export function useUpdateService() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Check for updates
  const checkForUpdates = useCallback(async () => {
    setIsChecking(true);
    try {
      const info = await updateService.checkForUpdates();
      setUpdateInfo(info);
      setLastChecked(new Date());
      return info;
    } catch (error) {
      console.error('[useUpdateService] Error checking for updates:', error);
      return null;
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Apply update
  const applyUpdate = useCallback(async () => {
    if (!updateInfo?.available) return;
    
    setIsUpdating(true);
    try {
      await updateService.applyUpdate();
      // The update service will handle the reload/restart
    } catch (error) {
      console.error('[useUpdateService] Error applying update:', error);
      setIsUpdating(false);
      throw error;
    }
  }, [updateInfo]);

  // Listen for update events
  useEffect(() => {
    const handleUpdateAvailable = (info: UpdateInfo) => {
      setUpdateInfo(info);
    };

    const handleUpdateApplied = () => {
      setUpdateInfo(null);
      setIsUpdating(false);
    };

    // Subscribe to update events
    updateService.onUpdateAvailable(handleUpdateAvailable);
    updateService.onUpdateApplied(handleUpdateApplied);

    // Enable automatic update checking
    checkForUpdates();

    // Periodic update checks every 30 minutes
    const interval = setInterval(checkForUpdates, 30 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Check for updates when app becomes visible (after 5 minutes of inactivity)
  const handleVisibilityChange = () => {
    if (!document.hidden && !isChecking) {
      const timeSinceLastCheck = lastChecked ? Date.now() - lastChecked.getTime() : Infinity;
      if (timeSinceLastCheck > 5 * 60 * 1000) {
        checkForUpdates();
      }
    }
  };

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return {
    updateInfo,
    isChecking,
    isUpdating,
    lastChecked,
    checkForUpdates,
    applyUpdate,
    hasUpdate: updateInfo?.available || false,
    isMandatory: updateInfo?.mandatory || false,
    isMobile: Capacitor.isNativePlatform()
  };
} 