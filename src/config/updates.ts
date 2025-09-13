export const UPDATE_CONFIG = {
  // PWA Configuration
  pwa: {
    // How often to check for updates (in milliseconds)
    checkInterval: 30 * 60 * 1000, // 30 minutes
    
    // How long to wait before checking again when app becomes visible (in milliseconds)
    visibilityCheckDelay: 5 * 60 * 1000, // 5 minutes
    
    // Service worker cache name
    cacheName: 'educhub-v1',
    
    // Files to cache
    cacheFiles: [
      '/',
      '/index.html',
      '/manifest.json'
    ]
  },
  
  // CodePush Configuration (Mobile)
  codePush: {
    // How often to check for updates (in milliseconds)
    checkInterval: 30 * 60 * 1000, // 30 minutes
    
    // Whether to show update notifications
    showNotifications: true,
    
    // Whether to auto-install updates
    autoInstall: false,
    
    // Update dialog settings
    dialog: {
      title: 'Update Available',
      mandatoryUpdateMessage: 'A mandatory update is required to continue using the app.',
      optionalUpdateMessage: 'A new version of the app is available with improvements and bug fixes.',
      mandatoryContinueButtonLabel: 'Continue',
      optionalIgnoreButtonLabel: 'Later',
      optionalInstallButtonLabel: 'Install'
    }
  },
  
  // General Update Settings
  general: {
    // Whether to enable update notifications
    enableNotifications: true,
    
    // Whether to show update badges
    showBadges: true,
    
    // Update check on app start
    checkOnStart: true,
    
    // Update check on app visibility change
    checkOnVisibilityChange: true,
    
    // Debug mode
    debug: process.env.NODE_ENV === 'development'
  }
};

// Environment-specific overrides
if (process.env.NODE_ENV === 'development') {
  UPDATE_CONFIG.general.debug = true;
  UPDATE_CONFIG.pwa.checkInterval = 2 * 60 * 1000; // 2 minutes in dev for testing
  UPDATE_CONFIG.codePush.checkInterval = 2 * 60 * 1000; // 2 minutes in dev for testing
}

export default UPDATE_CONFIG; 