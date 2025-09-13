import { Capacitor } from '@capacitor/core';
import { mockUpdateServer } from './mockUpdateServer';

/*
 * UPDATE SERVICE CONFIGURATION
 * 
 * 🔔 AUTOMATIC UPDATE POPUPS ENABLED
 * 
 * Current setup:
 * - CURRENT_APP_VERSION: v1.0.4 (installed version - users will see v1.0.5 as available)
 * - UPDATE_SERVER_URL: Development mock server / Production real server
 * - ENABLE_AUTOMATIC_UPDATES: true (popups enabled)
 * 
 * The app will now:
 * - ✅ Check for updates from server (mock in dev, real in production)
 * - ✅ Simulate real network requests with loading states
 * - ✅ Show automatic update popups/banners when updates are available
 * - ✅ Allow manual checking via Settings > Check for Updates
 * 
 * Development: Uses mockUpdateServer with realistic delays and scenarios
 * Production: Fetches from real update server API
 * 
 * To re-enable automatic popups:
 * - Uncomment the automatic update logic in the components
 * - Set general.enableNotifications = true in updates.ts
 */

export interface UpdateInfo {
  available: boolean;
  mandatory: boolean;
  version?: string;
  description?: string;
  packageSize?: number;
  currentVersion?: string;
  targetVersion?: string;
  isOTA?: boolean;
}

export interface UpdateService {
  checkForUpdates(): Promise<UpdateInfo>;
  applyUpdate(): Promise<void>;
  onUpdateAvailable(callback: (info: UpdateInfo) => void): void;
  onUpdateApplied(callback: () => void): void;
  checkVersionUpdate(): Promise<UpdateInfo>;
  checkOTAUpdate(): Promise<UpdateInfo>;
}

// IMPORTANT: Update these version numbers when you release a new version
// Current app version - this should match the version users have installed
const CURRENT_APP_VERSION = '1.0.4';

// Update server configuration
const UPDATE_SERVER_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3001/api/updates'  // Development server
  : 'https://your-update-server.com/api/updates'; // Production server

// Configuration flag to enable/disable automatic update checking
const ENABLE_AUTOMATIC_UPDATES = true;



class WebUpdateService implements UpdateService {
  private updateCallbacks: ((info: UpdateInfo) => void)[] = [];
  private appliedCallbacks: (() => void)[] = [];
  private swRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.initializeServiceWorker();
  }

  private async initializeServiceWorker() {
    try {
      // Check if service workers are supported
      if ('serviceWorker' in navigator) {
        // Register service worker manually since we're using Vite PWA
        const registration = await navigator.serviceWorker.register('/sw.js');
        this.swRegistration = registration;
        
        console.log('[UpdateService] Service worker registered');
        
        // Enable automatic update checking
        this.checkForUpdates();
        
        // Enable automatic service worker update detection
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                this.notifyUpdateAvailable({
                  available: true,
                  mandatory: false,
                  version: this.getAppVersion(),
                  isOTA: true
                });
              }
            });
          }
        });
        
        // Listen for controller change (update applied)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          this.notifyUpdateApplied();
        });
      }
    } catch (error) {
      console.error('[UpdateService] Failed to initialize service worker:', error);
    }
  }

  private getAppVersion(): string {
    return CURRENT_APP_VERSION;
  }

  async checkForUpdates(): Promise<UpdateInfo> {
    if (!this.swRegistration) {
      return { available: false, mandatory: false };
    }

    try {
      // Check if there's a waiting service worker
      if (this.swRegistration.waiting) {
        return {
          available: true,
          mandatory: false,
          version: this.getAppVersion(),
          isOTA: true
        };
      }

      // Force update check
      await this.swRegistration.update();
      
      return { available: false, mandatory: false };
    } catch (error) {
      console.error('[UpdateService] Error checking for updates:', error);
      return { available: false, mandatory: false };
    }
  }

  async checkVersionUpdate(): Promise<UpdateInfo> {
    const currentVersion = this.getAppVersion();
    
    try {
      console.log('[UpdateService] Checking for updates from server...');
      
      // Use mock server in development, real server in production
      let updateData;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[UpdateService] Using mock update server for development');
        updateData = await mockUpdateServer.checkForUpdates(currentVersion, 'web');
      } else {
        // Fetch update information from real server
        const response = await fetch(`${UPDATE_SERVER_URL}/check?currentVersion=${currentVersion}&platform=web`);
        
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }
        
        updateData = await response.json();
      }
      
      console.log('[UpdateService] Server response:', updateData);
      
      if (updateData.available) {
        console.log('[UpdateService] Update available from server');
        return {
          available: true,
          mandatory: updateData.mandatory || false,
          currentVersion: currentVersion,
          targetVersion: updateData.version,
          version: updateData.version,
          description: updateData.description || 'A new version is available with improvements and bug fixes.',
          packageSize: updateData.packageSize || 0,
          isOTA: false
        };
      } else {
        console.log('[UpdateService] No updates available from server');
        return { available: false, mandatory: false };
      }
      
    } catch (error) {
      console.error('[UpdateService] Error checking for updates:', error);
      
      // Mock server handles all development scenarios
      console.log('[UpdateService] Using mock server for development');
      
      return { available: false, mandatory: false };
    }
  }

  async checkOTAUpdate(): Promise<UpdateInfo> {
    // For web, check service worker updates
    return this.checkForUpdates();
  }

  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;
      
      if (part1 < part2) return -1;
      if (part1 > part2) return 1;
    }
    
    return 0;
  }

  async applyUpdate(): Promise<void> {
    if (!this.swRegistration?.waiting) {
      throw new Error('No update available to apply');
    }

    try {
      // Send message to waiting service worker to skip waiting
      this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload the page to apply the update
      window.location.reload();
    } catch (error) {
      console.error('[UpdateService] Error applying update:', error);
      throw error;
    }
  }

  onUpdateAvailable(callback: (info: UpdateInfo) => void): void {
    this.updateCallbacks.push(callback);
  }

  onUpdateApplied(callback: () => void): void {
    this.appliedCallbacks.push(callback);
  }

  private notifyUpdateAvailable(info: UpdateInfo): void {
    this.updateCallbacks.forEach(callback => callback(info));
  }

  private notifyUpdateApplied(): void {
    this.appliedCallbacks.forEach(callback => callback());
  }
}

class MobileUpdateService implements UpdateService {
  private updateCallbacks: ((info: UpdateInfo) => void)[] = [];
  private appliedCallbacks: (() => void)[] = [];
  private codePush: any = null;

  constructor() {
    this.initializeCodePush();
  }

  private async initializeCodePush() {
    try {
      // Dynamically import CodePush to avoid issues in web environment
      if (Capacitor.isNativePlatform()) {
        const { CodePush } = await import('cap-codepush');
        this.codePush = CodePush;
        
        // Check for updates on app start
        this.checkForUpdates();
        this.checkOTAUpdate();
        
        // Listen for update events
        this.codePush.addListener('updateAvailable', (info: any) => {
          this.notifyUpdateAvailable({
            available: true,
            mandatory: info.mandatory || false,
            version: info.version,
            description: info.description,
            packageSize: info.packageSize,
            isOTA: true
          });
        });

        this.codePush.addListener('updateInstalled', () => {
          this.notifyUpdateApplied();
        });

        this.codePush.addListener('updateDownloadProgress', (progress: any) => {
          console.log('[UpdateService] Download progress:', progress);
        });
      }
    } catch (error) {
      console.error('[UpdateService] Failed to initialize CodePush:', error);
    }
  }

  async checkForUpdates(): Promise<UpdateInfo> {
    if (!this.codePush || !Capacitor.isNativePlatform()) {
      return { available: false, mandatory: false };
    }

    try {
      const updateInfo = await this.codePush.checkForUpdate();
      return {
        available: updateInfo.updateAvailable || false,
        mandatory: updateInfo.mandatory || false,
        version: updateInfo.version,
        description: updateInfo.description,
        packageSize: updateInfo.packageSize,
        isOTA: true
      };
    } catch (error) {
      console.error('[UpdateService] Error checking for updates:', error);
      return { available: false, mandatory: false };
    }
  }

  async checkVersionUpdate(): Promise<UpdateInfo> {
    const currentVersion = CURRENT_APP_VERSION;
    
    try {
      console.log('[MobileUpdateService] Checking for updates from server...');
      
      // Use mock server in development, real server in production
      let updateData;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[MobileUpdateService] Using mock update server for development');
        updateData = await mockUpdateServer.checkForUpdates(currentVersion, 'mobile');
      } else {
        // Fetch update information from real server
        const response = await fetch(`${UPDATE_SERVER_URL}/check?currentVersion=${currentVersion}&platform=mobile`);
        
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }
        
        updateData = await response.json();
      }
      
      console.log('[MobileUpdateService] Server response:', updateData);
      
      if (updateData.available) {
        console.log('[MobileUpdateService] Update available from server');
        return {
          available: true,
          mandatory: updateData.mandatory || false,
          currentVersion: currentVersion,
          targetVersion: updateData.version,
          version: updateData.version,
          description: updateData.description || 'A new version is available with improvements and bug fixes.',
          packageSize: updateData.packageSize || 0,
          isOTA: false
        };
      } else {
        console.log('[MobileUpdateService] No updates available from server');
        return { available: false, mandatory: false };
      }
      
    } catch (error) {
      console.error('[MobileUpdateService] Error checking for updates:', error);
      
      // Mock server handles all development scenarios
      console.log('[MobileUpdateService] Using mock server for development');
      
      return { available: false, mandatory: false };
    }
  }

  async checkOTAUpdate(): Promise<UpdateInfo> {
    if (!this.codePush || !Capacitor.isNativePlatform()) {
      return { available: false, mandatory: false };
    }

    try {
      const updateInfo = await this.codePush.checkForUpdate();
      if (updateInfo.updateAvailable) {
        return {
          available: true,
          mandatory: updateInfo.mandatory || false,
          version: updateInfo.version,
          description: updateInfo.description || 'A new update is available and will be installed automatically.',
          packageSize: updateInfo.packageSize,
          isOTA: true
        };
      }
      return { available: false, mandatory: false };
    } catch (error) {
      console.error('[UpdateService] Error checking for OTA update:', error);
      return { available: false, mandatory: false };
    }
  }

  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;
      
      if (part1 < part2) return -1;
      if (part1 > part2) return 1;
    }
    
    return 0;
  }

  async applyUpdate(): Promise<void> {
    if (!this.codePush || !Capacitor.isNativePlatform()) {
      throw new Error('CodePush not available');
    }

    try {
      // For OTA updates, use CodePush sync
      await this.codePush.sync();
    } catch (error) {
      console.error('[UpdateService] Error applying update:', error);
      throw error;
    }
  }

  onUpdateAvailable(callback: (info: UpdateInfo) => void): void {
    this.updateCallbacks.push(callback);
  }

  onUpdateApplied(callback: () => void): void {
    this.appliedCallbacks.push(callback);
  }

  private notifyUpdateAvailable(info: UpdateInfo): void {
    this.updateCallbacks.forEach(callback => callback(info));
  }

  private notifyUpdateApplied(): void {
    this.appliedCallbacks.forEach(callback => callback());
  }
}

// Factory function to create the appropriate update service
export function createUpdateService(): UpdateService {
  if (Capacitor.isNativePlatform()) {
    return new MobileUpdateService();
  } else {
    return new WebUpdateService();
  }
}

// Export singleton instance
export const updateService = createUpdateService(); 