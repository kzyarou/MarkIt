// Test Update Mode Utility
// Use this to control the mock update server for testing

import { mockUpdateServer } from '@/services/mockUpdateServer';

export class TestUpdateMode {
  /**
   * 🧪 Enable test mode - will always show v1.0.6 as available
   */
  static enableTestMode() {
    mockUpdateServer.enableTestMode();
    console.log('🧪 TEST UPDATE MODE ENABLED');
    console.log('📱 App will now show v1.0.6 as available for testing');
    console.log('🔍 Check console for [MockUpdateServer] logs');
  }

  /**
   * 🚫 Disable test mode - restore normal update logic
   */
  static disableTestMode() {
    mockUpdateServer.disableTestMode();
    console.log('🚫 TEST UPDATE MODE DISABLED');
    console.log('📱 App will now use normal update logic');
  }

  /**
   * 📊 Check current test mode status
   */
  static getStatus() {
    const isEnabled = mockUpdateServer.isTestModeEnabled();
    console.log(`🧪 TEST UPDATE MODE: ${isEnabled ? 'ENABLED' : 'DISABLED'}`);
    return isEnabled;
  }

  /**
   * 🧪 Quick test - enable test mode and show instructions
   */
  static quickTest() {
    this.enableTestMode();
    console.log('\n🧪 QUICK TEST INSTRUCTIONS:');
    console.log('1. Go to Settings → "Check for Updates"');
    console.log('2. Click the button to test update detection');
    console.log('3. You should see v1.0.6 available');
    console.log('4. Check console for detailed logs');
    console.log('5. Use TestUpdateMode.disableTestMode() to restore normal behavior\n');
  }
}

// Make it available globally for easy testing
if (typeof window !== 'undefined') {
  (window as any).TestUpdateMode = TestUpdateMode;
  console.log('🧪 TestUpdateMode available globally as window.TestUpdateMode');
  console.log('📱 Use TestUpdateMode.quickTest() to start testing');
} 