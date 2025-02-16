import { Dashboard } from '../../types';
import { config } from '../../config';

interface StorageData {
  dashboards: Dashboard[];
}

class StorageManager {
  private static instance: StorageManager;

  private constructor() {}

  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  getData(): StorageData {
    try {
      const { prefix, version } = config.getConfig().storage;
      const key = `${prefix}${version}_data`;
      const data = localStorage.getItem(key);
      if (!data) {
        return {
          dashboards: [],
        };
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading from storage:', error);
      return {
        dashboards: [],
      };
    }
  }

  setData(data: StorageData): void {
    try {
      const { prefix, version } = config.getConfig().storage;
      const key = `${prefix}${version}_data`;
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error writing to storage:', error);
    }
  }

  clearData(): void {
    try {
      const { prefix, version } = config.getConfig().storage;
      const key = `${prefix}${version}_data`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  // Helper method to simulate API latency
  async simulateLatency(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100));
  }
}

export const storage = StorageManager.getInstance();