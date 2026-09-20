/**
 * Event Scheduler — Native Bridge
 * Haptic feedback and native status bar utilities.
 */

class NativeBridge {
  constructor() {
    this.isCapacitor = typeof window !== 'undefined' && Boolean(window.Capacitor?.isNativePlatform?.());
  }

  isNative() {
    if (typeof window === 'undefined') return false;
    return Boolean(
      window.Capacitor?.isNativePlatform?.() ||
      (window.Capacitor?.getPlatform && window.Capacitor.getPlatform() !== 'web')
    );
  }

  triggerHaptic(type = 'light') {
    if (this.isNative() && window.Capacitor?.Plugins?.Haptics) {
      try {
        if (type === 'success') {
          window.Capacitor.Plugins.Haptics.notification({ type: 'SUCCESS' });
        } else if (type === 'warning') {
          window.Capacitor.Plugins.Haptics.notification({ type: 'WARNING' });
        } else {
          window.Capacitor.Plugins.Haptics.impact({ style: 'LIGHT' });
        }
      } catch {}
    } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(50);
      } catch {}
    }
  }
}

export const nativeBridge = new NativeBridge();
