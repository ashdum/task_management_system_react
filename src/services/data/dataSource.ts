// src/services/data/dataSource.ts
// DataSource facade: selects implementation based on config

import { LocalDataSource } from './localDataSource';
import { RestDataSource } from './restDataSource';
import { GraphQLDataSource } from './graphqlDataSource';
import type { DataSource } from './interface/dataSourceTypes';
import { config, DataSourceType } from '../../config';

class DataSourceFactory {
  private static instance: DataSource;
  private constructor() {}

  public static getDataSource(): DataSource {
    if (!DataSourceFactory.instance) {
      const sourceType = config.getDataSource();
      switch (sourceType) {
        case DataSourceType.LOCAL:
          DataSourceFactory.instance = new LocalDataSource();
          break;
        case DataSourceType.REST:
          DataSourceFactory.instance = new RestDataSource();
          break;
        case DataSourceType.GRAPHQL:
          DataSourceFactory.instance = new GraphQLDataSource();
          break;
        default:
          console.warn(`Unknown data source type: ${sourceType}, defaulting to REST`);
          DataSourceFactory.instance = new LocalDataSource();
      }
    }
    return DataSourceFactory.instance;
  }
}

export const dataSource = DataSourceFactory.getDataSource();
