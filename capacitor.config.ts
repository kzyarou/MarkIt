import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kzyarou.educhub',
  appName: 'MarkIt',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    CodePush: {
      serverUrl: 'https://codepush.appcenter.ms/',
      deploymentKey: {
        android: 'YOUR_ANDROID_DEPLOYMENT_KEY',
        ios: 'YOUR_IOS_DEPLOYMENT_KEY'
      }
    }
  }
};

export default config;
