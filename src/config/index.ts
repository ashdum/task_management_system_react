// src/config/index.ts
// Application configuration with zod validation
// This file combines features from both original configs

import { z } from 'zod';

// Define data source types as constant object
export const DataSourceType = {
  LOCAL: 'local',
  REST: 'rest',
  GRAPHQL: 'graphql',
} as const;
export type DataSourceType = typeof DataSourceType[keyof typeof DataSourceType];

// Configuration schema with an added "refreshUrl" in auth config
const configSchema = z.object({
  dataSource: z.enum([DataSourceType.LOCAL, DataSourceType.REST, DataSourceType.GRAPHQL]),
  api: z.object({
    baseUrl: z.string().url(),
    timeout: z.number().positive().default(10000),
    endpoints: z.object({
      graphql: z.string(),
      rest: z.object({
        auth: z.string(),
        users: z.string(),
        dashboards: z.string(),
        cards: z.string(),
      }),
    }),
  }),
  auth: z.object({
    tokenKey: z.string(),
    refreshTokenKey: z.string(),
    // Added refreshUrl similar to config.ts logic
    refreshUrl: z.string().url(),
  }),
  storage: z.object({
    prefix: z.string(),
    version: z.string(),
  }),
});

// Define Config type based on schema
export type Config = z.infer<typeof configSchema>;

// Helper function to determine the data source type from environment variables
const getDataSourceType = (): DataSourceType => {
  const type = import.meta.env.VITE_DATA_SOURCE_TYPE?.toLowerCase();
  switch (type) {
    case 'rest':
      return DataSourceType.REST;
    case 'graphql':
      return DataSourceType.GRAPHQL;
    default:
      return DataSourceType.LOCAL;
  }
};

// Load configuration from environment variables
const loadConfig = (): Config => {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  return {
    dataSource: getDataSourceType(),
    api: {
      baseUrl:import.meta.env.VITE_API_URL || 'http://localhost:8080',
      timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
      endpoints: {
        graphql: import.meta.env.VITE_API_ENDPOINT_GRAPHQL || '/graphql',
        rest: {
          auth: import.meta.env.VITE_API_ENDPOINT_AUTH || '/auth',
          users: import.meta.env.VITE_API_ENDPOINT_USERS || '/users',
          dashboards: import.meta.env.VITE_API_ENDPOINT_DASHBOARDS || '/dashboards',
          cards: import.meta.env.VITE_API_ENDPOINT_CARDS || '/cards',
        },
      },
    },
    auth: {
      tokenKey: import.meta.env.VITE_AUTH_TOKEN_KEY || 'authToken',
      refreshTokenKey: import.meta.env.VITE_AUTH_REFRESH_TOKEN_KEY || 'refreshToken',
      // Using environment variable for refreshUrl, defaulting to baseUrl + '/auth/refresh'
      refreshUrl: import.meta.env.VITE_API_REFRESH_URL || (baseUrl + '/auth/refresh'),
    },
    storage: {
      prefix: import.meta.env.VITE_STORAGE_PREFIX || 'app_',
      version: import.meta.env.VITE_STORAGE_VERSION || '1.0',
    },
  };
};

// Singleton configuration manager for global access
class ConfigManager {
  private static instance: ConfigManager;
  private config: Config;

  private constructor() {
    this.config = configSchema.parse(loadConfig());
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  // Get the whole configuration
  public getConfig(): Config {
    return this.config;
  }

  // Update configuration with new partial values
  public updateConfig(newConfig: Partial<Config>): void {
    try {
      // Merging configs shallowly; for deep merge, consider a custom merge function
      const mergedConfig = {
        ...this.config,
        ...newConfig,
      };
      this.config = configSchema.parse(mergedConfig);
    } catch (error) {
      console.error('Invalid configuration:', error);
      throw new Error('Invalid configuration provided');
    }
  }

  // Helper to get specific parts of the configuration
  public getDataSource(): DataSourceType {
    return this.config.dataSource;
  }

  public getApiConfig() {
    return this.config.api;
  }

  public getAuthConfig() {
    return this.config.auth;
  }

  public getStorageConfig() {
    return this.config.storage;
  }
}

// Export singleton instance for use throughout the application
export const config = ConfigManager.getInstance();
