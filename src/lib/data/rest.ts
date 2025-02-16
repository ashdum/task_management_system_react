import { config } from '../../config';
import { authInterceptor } from '../auth/interceptor';
import type { DataSource } from './types';
import type {
  User,
  Dashboard,
  Card,
  Column,
  ApiResponse,
} from '../../types';

export class RestDataSource implements DataSource {
  private baseUrl: string;
  private endpoints: {
    auth: string;
    users: string;
    dashboards: string;
    cards: string;
  };

  constructor() {
    const { baseUrl, endpoints } = config.getConfig().api;
    this.baseUrl = baseUrl;
    this.endpoints = endpoints.rest;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    try {
      const request = new Request(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      // Apply auth interceptor
      const interceptedRequest = await authInterceptor.interceptRequest(request);
      const response = await fetch(interceptedRequest);

      // Handle response with auth interceptor
      return await authInterceptor.handleResponse<T>(response);
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          code: 'API_ERROR',
        },
      };
    }
  }

  // Auth methods
  async login(email: string, password: string): Promise<ApiResponse<User>> {
    return this.request<User>('POST', `${this.endpoints.auth}/login`, { email, password });
  }

  async register(email: string, password: string): Promise<ApiResponse<User>> {
    return this.request<User>('POST', `${this.endpoints.auth}/register`, { email, password });
  }

  async logout(): Promise<void> {
    localStorage.removeItem(config.getConfig().auth.tokenKey);
  }

  // Dashboard methods
  async getDashboards(): Promise<ApiResponse<Dashboard[]>> {
    return this.request<Dashboard[]>('GET', this.endpoints.dashboards);
  }

  async getDashboard(id: string): Promise<ApiResponse<Dashboard>> {
    return this.request<Dashboard>('GET', `${this.endpoints.dashboards}/${id}`);
  }

  async createDashboard(title: string, userId: string): Promise<ApiResponse<Dashboard>> {
    return this.request<Dashboard>('POST', this.endpoints.dashboards, { title, userId });
  }

  async updateDashboard(id: string, data: Partial<Dashboard>): Promise<ApiResponse<Dashboard>> {
    return this.request<Dashboard>('PUT', `${this.endpoints.dashboards}/${id}`, data);
  }

  async deleteDashboard(id: string): Promise<ApiResponse<void>> {
    return this.request<void>('DELETE', `${this.endpoints.dashboards}/${id}`);
  }

  // Column methods
  async createColumn(dashboardId: string, title: string): Promise<ApiResponse<Column>> {
    return this.request<Column>(
      'POST',
      `${this.endpoints.dashboards}/${dashboardId}/columns`,
      { title }
    );
  }

  async updateColumn(
    dashboardId: string,
    columnId: string,
    data: Partial<Column>
  ): Promise<ApiResponse<Column>> {
    return this.request<Column>(
      'PUT',
      `${this.endpoints.dashboards}/${dashboardId}/columns/${columnId}`,
      data
    );
  }

  async deleteColumn(dashboardId: string, columnId: string): Promise<ApiResponse<void>> {
    return this.request<void>(
      'DELETE',
      `${this.endpoints.dashboards}/${dashboardId}/columns/${columnId}`
    );
  }

  async updateColumnOrder(
    dashboardId: string,
    columnIds: string[]
  ): Promise<ApiResponse<void>> {
    return this.request<void>(
      'PUT',
      `${this.endpoints.dashboards}/${dashboardId}/columns/order`,
      { columnIds }
    );
  }

  // Card methods
  async createCard(
    dashboardId: string,
    columnId: string,
    title: string
  ): Promise<ApiResponse<Card>> {
    return this.request<Card>(
      'POST',
      `${this.endpoints.dashboards}/${dashboardId}/columns/${columnId}/cards`,
      { title }
    );
  }

  async updateCard(
    dashboardId: string,
    columnId: string,
    cardId: string,
    data: Partial<Card>
  ): Promise<ApiResponse<Card>> {
    return this.request<Card>(
      'PUT',
      `${this.endpoints.dashboards}/${dashboardId}/columns/${columnId}/cards/${cardId}`,
      data
    );
  }

  async deleteCard(
    dashboardId: string,
    columnId: string,
    cardId: string
  ): Promise<ApiResponse<void>> {
    return this.request<void>(
      'DELETE',
      `${this.endpoints.dashboards}/${dashboardId}/columns/${columnId}/cards/${cardId}`
    );
  }

  async moveCard(
    dashboardId: string,
    fromColumnId: string,
    toColumnId: string,
    cardId: string,
    newIndex: number
  ): Promise<ApiResponse<void>> {
    return this.request<void>(
      'PUT',
      `${this.endpoints.dashboards}/${dashboardId}/cards/${cardId}/move`,
      {
        fromColumnId,
        toColumnId,
        newIndex,
      }
    );
  }
}