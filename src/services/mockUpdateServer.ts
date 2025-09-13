// Mock Update Server for Development
// This simulates a real update server to make update checking feel authentic

export interface MockUpdateResponse {
  available: boolean;
  version?: string;
  description?: string;
  packageSize?: number;
  mandatory?: boolean;
  downloadUrl?: string;
  releaseNotes?: string;
  releaseDate?: string;
}

class MockUpdateServer {
  private serverDelay = 1500; // Simulate network delay
  private isServerDown = false; // Simulate server issues
  
  // 🧪 TEST MODE: Set to true to always show updates for testing
  private testMode = false;

  // Simulate server being down occasionally
  private simulateServerIssues() {
    if (Math.random() < 0.1) { // 10% chance of server being down
      this.isServerDown = true;
      setTimeout(() => {
        this.isServerDown = false;
      }, 5000); // Server comes back after 5 seconds
    }
  }

  async checkForUpdates(currentVersion: string, platform: string): Promise<MockUpdateResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, this.serverDelay));
    
    // Simulate server issues
    this.simulateServerIssues();
    
    if (this.isServerDown) {
      throw new Error('Server temporarily unavailable');
    }

    // 🧪 TEST UPDATE SCENARIO: Always show v1.0.6 as available for testing
    if (this.testMode) {
      console.log(`[MockUpdateServer] 🧪 TEST MODE ENABLED: Current version ${currentVersion}, showing v1.0.6 as available`);
      
      // Force test update scenario - always show v1.0.6 available
      return {
        available: true,
        version: '1.0.6',
        description: '🧪 TEST UPDATE: EducHub v1.0.6 is available! This is a test update to verify the update notification system is working properly. New features include enhanced update checking, improved UI, and better performance.',
        packageSize: 4500000, // 4.5MB
        mandatory: false,
        downloadUrl: 'https://downloads.educhub.com/v1.0.6',
        releaseNotes: '🧪 TEST UPDATE FEATURES:\n• Enhanced update notification system\n• Improved UI/UX design\n• Better performance and stability\n• Bug fixes and optimizations\n• Test update detection working!',
        releaseDate: '2024-01-20'
      };
    }

    // Simulate different update scenarios
    const updateScenarios = [
      {
        available: true,
        version: '1.0.5',
        description: '🚀 Major Update Available! New features include improved performance, enhanced security, and a redesigned user interface.',
        packageSize: 4200000, // 4.2MB
        mandatory: false,
        downloadUrl: 'https://downloads.educhub.com/v1.0.5',
        releaseNotes: '• Performance improvements\n• Security enhancements\n• UI/UX redesign\n• Bug fixes',
        releaseDate: '2024-01-20'
      },
      {
        available: true,
        version: '1.0.4',
        description: '🔄 Minor Update Available! Bug fixes and performance improvements.',
        packageSize: 1800000, // 1.8MB
        mandatory: false,
        downloadUrl: 'https://downloads.educhub.com/v1.0.4',
        releaseNotes: '• Bug fixes\n• Performance improvements\n• Minor UI updates',
        releaseDate: '2024-01-10'
      },
      {
        available: false,
        description: 'You are running the latest version of EducHub!'
      }
    ];

    // Choose scenario based on current version
    if (currentVersion === '1.0.4') {
      return updateScenarios[0]; // v1.0.5 available
    } else if (currentVersion === '1.0.3') {
      return updateScenarios[1]; // v1.0.4 available
    } else {
      return updateScenarios[2]; // No updates
    }
  }

  async getUpdateDetails(version: string): Promise<MockUpdateResponse> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      available: true,
      version,
      description: `Detailed information for EducHub ${version}`,
      packageSize: 4000000,
      mandatory: false,
      downloadUrl: `https://downloads.educhub.com/v${version}`,
      releaseNotes: '• Feature A\n• Feature B\n• Bug fixes\n• Performance improvements',
      releaseDate: '2024-01-15'
    };
  }

  // Simulate download progress
  async downloadUpdate(version: string, onProgress?: (progress: number) => void): Promise<void> {
    const totalSteps = 100;
    
    for (let i = 0; i <= totalSteps; i++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      onProgress?.(i / totalSteps);
    }
  }

  // 🧪 TEST MODE CONTROLS
  enableTestMode() {
    this.testMode = true;
    console.log('[MockUpdateServer] 🧪 TEST MODE ENABLED - Will always show v1.0.6 as available');
  }

  disableTestMode() {
    this.testMode = false;
    console.log('[MockUpdateServer] 🧪 TEST MODE DISABLED - Normal update logic restored');
  }

  isTestModeEnabled() {
    return this.testMode;
  }
}

export const mockUpdateServer = new MockUpdateServer(); 