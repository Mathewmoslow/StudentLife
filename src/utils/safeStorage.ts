/**
 * Safe wrapper for localStorage operations
 * Handles errors gracefully and provides fallback behavior
 */

class SafeStorage {
  private memoryStorage: Map<string, string> = new Map();
  private isAvailable: boolean = true;

  constructor() {
    // Test if localStorage is available
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      this.isAvailable = true;
    } catch {
      console.warn('localStorage is not available, using memory storage as fallback');
      this.isAvailable = false;
    }
  }

  getItem(key: string): string | null {
    try {
      if (this.isAvailable) {
        return localStorage.getItem(key);
      }
      return this.memoryStorage.get(key) || null;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return this.memoryStorage.get(key) || null;
    }
  }

  setItem(key: string, value: string): boolean {
    try {
      if (this.isAvailable) {
        localStorage.setItem(key, value);
      }
      this.memoryStorage.set(key, value);
      return true;
    } catch (error) {
      console.error('Error writing to storage:', error);
      // Still save to memory storage
      this.memoryStorage.set(key, value);
      return false;
    }
  }

  removeItem(key: string): boolean {
    try {
      if (this.isAvailable) {
        localStorage.removeItem(key);
      }
      this.memoryStorage.delete(key);
      return true;
    } catch (error) {
      console.error('Error removing from storage:', error);
      this.memoryStorage.delete(key);
      return false;
    }
  }

  clear(): boolean {
    try {
      if (this.isAvailable) {
        localStorage.clear();
      }
      this.memoryStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      this.memoryStorage.clear();
      return false;
    }
  }

  /**
   * Get parsed JSON value with type safety
   */
  getJSON<T>(key: string, defaultValue: T): T {
    try {
      const item = this.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item) as T;
    } catch {
      return defaultValue;
    }
  }

  /**
   * Set JSON value with error handling
   */
  setJSON<T>(key: string, value: T): boolean {
    try {
      return this.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error serializing to JSON:', error);
      return false;
    }
  }
}

// Export singleton instance
export const safeStorage = new SafeStorage();

// Also export as default
export default safeStorage;