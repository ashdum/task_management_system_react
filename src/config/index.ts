// src/config/index.ts
import { z } from 'zod';

export const DataSourceType = {
  LOCAL: 'local',
  REST: 'rest',
  GRAPHQL: 'graphql',
} as const;
export type DataSourceType = typeof DataSourceType[keyof typeof DataSourceType];

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
    refreshUrl: z.string().url(),
    googleClientId: z.string().nonempty(), 
    githubClientId: z.string().nonempty(), 
  }),
  storage: z.object({
    prefix: z.string(),
    version: z.string(),
  }),
});

export type Config = z.infer<typeof configSchema>;

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

const loadConfig = (): Config => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  return {
    dataSource: getDataSourceType(),
    api: {
      baseUrl,
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
      refreshUrl: import.meta.env.VITE_API_REFRESH_URL || `${baseUrl}/auth/refresh`,
      googleClientId: import.meta.env.REACT_APP_GOOGLE_CLIENT_ID || 'test-google-client-id', 
      githubClientId: import.meta.env.REACT_APP_GITHUB_CLIENT_ID || 'test-github-client-id',
    },
    storage: {
      prefix: import.meta.env.VITE_STORAGE_PREFIX || 'app_',
      version: import.meta.env.VITE_STORAGE_VERSION || '1.0',
    },
  };
};

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

  public getConfig(): Config {
    return this.config;
  }

  public updateConfig(newConfig: Partial<Config>): void {
    try {
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

export const config = ConfigManager.getInstance();