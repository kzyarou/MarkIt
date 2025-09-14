# MarkIt Auto-Update System

This document describes the comprehensive auto-update system implemented in MarkIt, which provides seamless updates across web and mobile platforms.

## Overview

The auto-update system consists of:
- **Web App**: PWA service worker with automatic updates
- **Mobile Apps**: CodePush integration for OTA updates
- **Shared Logic**: Unified update service and notification system

## Features

✅ **Automatic Update Detection**: Checks for updates every 30 minutes  
✅ **Seamless Updates**: Web app updates without page reload when possible  
✅ **Mobile OTA Updates**: Over-the-air updates for Android/iOS apps  
✅ **Smart Notifications**: Context-aware update prompts  
✅ **Offline Support**: Service worker caching for offline functionality  
✅ **Cross-Platform**: Shared update logic between web and mobile  

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web App      │    │  Mobile App     │    │  Shared Logic   │
│                 │    │                 │    │                 │
│ • PWA SW       │    │ • CodePush      │    │ • UpdateService │
│ • Auto-update  │    │ • OTA Updates   │    │ • Notifications │
│ • Cache        │    │ • Silent Sync   │    │ • Hooks         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Setup Instructions

### 1. Dependencies

The following packages are already installed:
```bash
npm install vite-plugin-pwa workbox-window cap-codepush
```

### 2. Configuration Files

#### Vite Configuration (`vite.config.ts`)
- PWA plugin with auto-update enabled
- Service worker registration
- Manifest generation
- Workbox configuration

#### Capacitor Configuration (`capacitor.config.ts`)
- CodePush plugin configuration
- Platform-specific deployment keys

### 3. Environment Setup

#### For Web (PWA)
1. Build the app: `npm run build:pwa`
2. Deploy to your hosting service
3. Service worker will automatically handle updates

#### For Mobile (CodePush)
1. Set up App Center CodePush account
2. Get deployment keys for Android/iOS
3. Update `capacitor.config.ts` with your keys
4. Build mobile apps: `npm run build:android` or `npm run build:ios`

## Usage

### Basic Usage

The update system works automatically once configured. Users will see update notifications when new versions are available.

### Manual Update Check

```typescript
import { useUpdateService } from '@/hooks/useUpdateService';

function MyComponent() {
  const { checkForUpdates, hasUpdate, applyUpdate } = useUpdateService();
  
  return (
    <div>
      {hasUpdate && (
        <button onClick={applyUpdate}>
          Update Available - Click to Update
        </button>
      )}
      <button onClick={checkForUpdates}>
        Check for Updates
      </button>
    </div>
  );
}
```

### Update Notification Component

The `UpdateNotification` component is automatically included in the main App component and will show update prompts when needed.

## Configuration Options

### Update Intervals

```typescript
// src/config/updates.ts
export const UPDATE_CONFIG = {
  pwa: {
    checkInterval: 30 * 60 * 1000, // 30 minutes
    visibilityCheckDelay: 5 * 60 * 1000, // 5 minutes
  },
  codePush: {
    checkInterval: 30 * 60 * 1000, // 30 minutes
    autoInstall: false, // Set to true for automatic updates
  }
};
```

### PWA Settings

```typescript
// vite.config.ts
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    // Custom caching strategies
  }
})
```

### CodePush Settings

```typescript
// capacitor.config.ts
plugins: {
  CodePush: {
    serverUrl: 'https://codepush.appcenter.ms/',
    deploymentKey: {
      android: 'YOUR_ANDROID_KEY',
      ios: 'YOUR_IOS_KEY'
    }
  }
}
```

## Build Commands

```bash
# Build for web (PWA)
npm run build:pwa

# Build for mobile
npm run build:mobile

# Build specific platforms
npm run build:android
npm run build:ios

# Open platform-specific IDEs
npm run open:android
npm run open:ios
```

## Update Flow

### Web App Updates
1. Service worker detects new version
2. Downloads and caches new resources
3. Shows update notification
4. User clicks update → page reloads with new version

### Mobile App Updates
1. CodePush checks for updates on app start
2. Downloads update package in background
3. Shows update notification
4. User installs update → app restarts with new version

## Troubleshooting

### Common Issues

#### Service Worker Not Registering
- Check browser console for errors
- Ensure HTTPS (required for service workers)
- Verify PWA plugin configuration

#### CodePush Not Working
- Check deployment keys in capacitor config
- Verify App Center setup
- Check network connectivity

#### Updates Not Detected
- Verify build process completed successfully
- Check update intervals in configuration
- Ensure proper versioning in package.json

### Debug Mode

Enable debug logging in development:
```typescript
// src/config/updates.ts
if (process.env.NODE_ENV === 'development') {
  UPDATE_CONFIG.general.debug = true;
}
```

## Production Deployment

### Web Deployment
1. Build with `npm run build:pwa`
2. Deploy to hosting service (Netlify, Vercel, etc.)
3. Ensure HTTPS is enabled
4. Test PWA installation

### Mobile Deployment
1. Build with `npm run build:mobile`
2. Open in platform IDE
3. Build and archive app
4. Upload to app stores
5. Configure CodePush deployments

## Security Considerations

- Service workers run in secure context (HTTPS required)
- CodePush updates are signed and verified
- Update notifications are non-intrusive
- Users maintain control over update installation

## Performance Impact

- Update checks are lightweight and infrequent
- Service worker caching improves app performance
- Background updates minimize user disruption
- Smart update intervals balance freshness and performance

## Future Enhancements

- [ ] Push notifications for critical updates
- [ ] Delta updates for smaller package sizes
- [ ] A/B testing for gradual rollouts
- [ ] Analytics for update success rates
- [ ] Rollback functionality for failed updates

## Support

For issues or questions:
1. Check browser console for errors
2. Verify configuration files
3. Test on different platforms
4. Review update service logs

---

**Note**: This system ensures users always have the latest version of MarkIt with minimal disruption to their workflow. 