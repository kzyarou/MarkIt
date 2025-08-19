import { Capacitor } from '@capacitor/core';

export interface UpdateInfo {
  available: boolean;
  mandatory: boolean;
  version?: string;
  description?: string;
  packageSize?: number;
}

export interface UpdateService {
  checkForUpdates(): Promise<UpdateInfo>;
  applyUpdate(): Promise<void>;
  onUpdateAvailable(callback: (info: UpdateInfo) => void): void;
  onUpdateApplied(callback: () => void): void;
}

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
        
        // Check for updates
        this.checkForUpdates();
        
        // Listen for service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                this.notifyUpdateAvailable({
                  available: true,
                  mandatory: false,
                  version: this.getAppVersion()
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
    // You can customize this to get version from package.json or environment
    return process.env.npm_package_version || '1.0.0';
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
          version: this.getAppVersion()
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
        
        // Listen for update events
        this.codePush.addListener('updateAvailable', (info: any) => {
          this.notifyUpdateAvailable({
            available: true,
            mandatory: info.mandatory || false,
            version: info.version,
            description: info.description,
            packageSize: info.packageSize
          });
        });

        this.codePush.addListener('updateInstalled', () => {
          this.notifyUpdateApplied();
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
        packageSize: updateInfo.packageSize
      };
    } catch (error) {
      console.error('[UpdateService] Error checking for updates:', error);
      return { available: false, mandatory: false };
    }
  }

  async applyUpdate(): Promise<void> {
    if (!this.codePush || !Capacitor.isNativePlatform()) {
      throw new Error('CodePush not available');
    }

    try {
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