import { DataSourceType, config } from '../../config';
import { LocalDataSource } from './local';
import { RestDataSource } from './rest';
import { GraphQLDataSource } from './graphql';
import type { DataSource } from './types';

class DataSourceFactory {
  private static instance: DataSourceFactory;
  private dataSource: DataSource;

  private constructor() {
    this.dataSource = this.createDataSource();
  }

  public static getInstance(): DataSourceFactory {
    if (!DataSourceFactory.instance) {
      DataSourceFactory.instance = new DataSourceFactory();
    }
    return DataSourceFactory.instance;
  }

  private createDataSource(): DataSource {
    const sourceType = config.getDataSource();

    switch (sourceType) {
      case DataSourceType.LOCAL:
        return new LocalDataSource();
      case DataSourceType.REST:
        return new RestDataSource();
      case DataSourceType.GRAPHQL:
        return new GraphQLDataSource();
      default:
        throw new Error(`Unsupported data source type: ${sourceType}`);
    }
  }

  public getDataSource(): DataSource {
    return this.dataSource;
  }

  public updateDataSource(sourceType: DataSourceType): void {
    config.updateConfig({ dataSource: sourceType });
    this.dataSource = this.createDataSource();
  }
}

export const dataSource = DataSourceFactory.getInstance().getDataSource();