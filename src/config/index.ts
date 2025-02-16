import { z } from 'zod';

// Data source types
export const DataSourceType = {
  LOCAL: 'local',
  REST: 'rest',
  GRAPHQL: 'graphql',
} as const;

export type DataSourceType = typeof DataSourceType[keyof typeof DataSourceType];

// Configuration schema
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
  }),
  storage: z.object({
    prefix: z.string(),
    version: z.string(),
  }),
});

export type Config = z.infer<typeof configSchema>;

// Get data source type from environment
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
  return {
    dataSource: getDataSourceType(),
    api: {
      baseUrl: import.meta.env.VITE_API_URL,
      timeout: 10000,
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
    },
    storage: {
      prefix: import.meta.env.VITE_STORAGE_PREFIX || 'app_',
      version: import.meta.env.VITE_STORAGE_VERSION || '1.0',
    },
  };
};

// Configuration singleton
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