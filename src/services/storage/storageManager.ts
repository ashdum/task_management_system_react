// src/services/storage/storageManager.ts
// Manager for localStorage with simulated latency

import { config } from '../../config';
import type { Dashboard } from '../../types';

interface StorageData {
  dashboards: Dashboard[];
  // Можно добавить другие сущности при необходимости
}

const DEFAULT_DATA: StorageData = {
  dashboards: [],
};

class StorageManager {
  private static instance: StorageManager;
  private storageKey: string;

  private constructor() {
    const { prefix, version } = config.getStorageConfig();
    this.storageKey = `${prefix}${version}_data`;
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify(DEFAULT_DATA));
    }
  }

  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  getData(): StorageData {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : { ...DEFAULT_DATA };
    } catch (error) {
      console.error('Error reading from storage:', error);
      return { ...DEFAULT_DATA };
    }
  }

  setData(data: StorageData): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error writing to storage:', error);
    }
  }

  clearData(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  async simulateLatency(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100));
  }
}

export const storageManager = StorageManager.getInstance();
