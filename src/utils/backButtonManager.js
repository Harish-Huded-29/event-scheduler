import { App as CapApp } from '@capacitor/app';

class BackButtonManager {
  constructor() {
    this.stack = [];
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;
    try {
      const plugin = window.Capacitor?.Plugins?.App || CapApp;
      if (plugin?.addListener) {
        plugin.addListener('backButton', () => {
          this.handleBack();
        });
      }
      this.isInitialized = true;
    } catch (e) {
      console.warn('Native back button listener initialization warning:', e);
    }
  }

  /**
   * Register a back action with an optional priority.
   * Higher priority actions run before lower priority actions.
   * @param {Function} handler - function to execute when back button is pressed
   * @param {number} priority - priority number (higher = handles first)
   * @returns {Function} unregister function
   */
  register(handler, priority = 0) {
    this.init();
    const entry = { handler, priority, id: Math.random() };
    this.stack.push(entry);
    // Sort descending by priority so highest priority is first
    this.stack.sort((a, b) => b.priority - a.priority);

    return () => {
      this.stack = this.stack.filter((item) => item.id !== entry.id);
    };
  }

  handleBack() {
    if (this.stack.length > 0) {
      // Execute the top priority handler
      const top = this.stack[0];
      if (top && typeof top.handler === 'function') {
        top.handler();
      }
    }
  }
}

export const backButtonManager = new BackButtonManager();
