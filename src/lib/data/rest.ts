import { config } from '../../config';
import { authInterceptor } from '../auth/interceptor';
import type { DataSource } from './types';
import type {
  User,
  Dashboard,
  Card,
  Column,
  ApiResponse,
  DashboardInvitation,
  AuthResponse,
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
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem(config.getConfig().auth.tokenKey)}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        return {
          error: {
            message: `HTTP error! status: ${response.status}`,
            code: 'API_ERROR',
            status: response.status
          }
        };
      }

      const data = await response.json();
      
      if (data.error) {
        return {
          error: {
            message: data.error.message || 'Unknown error occurred',
            code: data.error.code || 'API_ERROR',
            status: data.error.status || response.status
          }
        };
      }

      return { 
        data,
        status: response.status
      };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          code: 'API_ERROR',
          status: 500
        }
      };
    }
  }

  // Auth methods
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(): Promise<void> {
    await this.request<void>('/auth/logout', {
      method: 'POST'
    });
  }

  // Dashboard methods
  async getDashboards(): Promise<ApiResponse<Dashboard[]>> {
    const response = await this.request<Dashboard[]>('/dashboards');

    if (response.error) {
      return {
        error: {
          ...response.error,
          status: response.error.status || 400
        }
      };
    }

    return {
      data: response.data,
      status: 200
    };
  }

  async getDashboard(id: string): Promise<ApiResponse<Dashboard>> {
    const response = await this.request<Dashboard>(`/dashboards/${id}`);

    if (response.error) {
      return {
        error: {
          ...response.error,
          status: response.error.status || 400
        }
      };
    }

    return {
      data: response.data,
      status: 200
    };
  }

  async createDashboard(title: string, userId: string): Promise<ApiResponse<Dashboard>> {
    const response = await this.request<Dashboard>('/dashboards', {
      method: 'POST',
      body: JSON.stringify({ title, userId }),
    });

    if (response.error) {
      return {
        error: {
          ...response.error,
          status: response.error.status || 400
        }
      };
    }

    return {
      data: response.data,
      status: 201
    };
  }

  async updateDashboard(id: string, data: Partial<Dashboard>): Promise<ApiResponse<Dashboard>> {
    const response = await this.request<Dashboard>(`/dashboards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (response.error) {
      return {
        error: {
          ...response.error,
          status: response.error.status || 400
        }
      };
    }

    return {
      data: response.data,
      status: 200
    };
  }

  async deleteDashboard(id: string): Promise<ApiResponse<void>> {
    const response = await this.request<void>(`/dashboards/${id}`, {
      method: 'DELETE',
    });

    if (response.error) {
      return {
        error: {
          ...response.error,
          status: response.error.status || 400
        }
      };
    }

    return {
      data: undefined,
      status: 200
    };
  }

  // Dashboard invitation methods
  async inviteToDashboard(
    dashboardId: string,
    email: string
  ): Promise<ApiResponse<DashboardInvitation>> {
    const response = await this.request<DashboardInvitation>(
      `/dashboards/${dashboardId}/invitations`,
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      }
    );

    if (response.error) {
      return {
        error: {
          ...response.error,
          status: response.error.status || 400
        }
      };
    }

    return {
      data: response.data,
      status: 201
    };
  }

  async acceptInvitation(invitationId: string): Promise<ApiResponse<void>> {
    const response = await this.request<void>(
      `/invitations/${invitationId}/accept`,
      {
        method: 'POST',
      }
    );

    if (response.error) {
      return {
        error: {
          ...response.error,
          status: response.error.status || 400
        }
      };
    }

    return {
      data: undefined,
      status: 200
    };
  }

  async rejectInvitation(invitationId: string): Promise<ApiResponse<void>> {
    const response = await this.request<void>(
      `/invitations/${invitationId}/reject`,
      {
        method: 'POST',
      }
    );

    if (response.error) {
      return {
        error: {
          ...response.error,
          status: response.error.status || 400
        }
      };
    }

    return {
      data: undefined,
      status: 200
    };
  }

  // Column methods
  async createColumn(dashboardId: string, title: string): Promise<ApiResponse<Column>> {
    const response = await this.request<Column>(
      `/dashboards/${dashboardId}/columns`,
      {
        method: 'POST',
        body: JSON.stringify({ title }),
      }
    );

    if (response.error) {
      return {
        error: {
          ...response.error,
          status: response.error.status || 400
        }
      };
    }

    return {
      data: response.data,
      status: 201
    };
  }

  async updateColumn(
    dashboardId: string,
    columnId: string,
    data: Partial<Column>
  ): Promise<ApiResponse<Column>> {
    const response = await this.request<Column>(
      `/dashboards/${dashboardId}/columns/${columnId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );

    if (response.error) {
      return {
        error: {
          ...response.error,
          status: response.error.status || 400
        }
      };
    }

    return {
      data: response.data,
      status: 200
    };
  }

  async deleteColumn(dashboardId: string, columnId: string): Promise<ApiResponse<void>> {
    const response = await this.request<void>(
      `/dashboards/${dashboardId}/columns/${columnId}`,
      {
        method: 'DELETE',
      }
    );

    if (response.error) {
      return {
        error: {
          ...response.error,
          status: response.error.status || 400
        }
      };
    }

    return {
      data: undefined,
      status: 200
    };
  }

  async updateColumnOrder(
    dashboardId: string,
    columnIds: string[]
  ): Promise<ApiResponse<void>> {
    const response = await this.request<void>(
      `/dashboards/${dashboardId}/columns/order`,
      {
        method: 'PUT',
        body: JSON.stringify({ columnIds }),
      }
    );

    if (response.error) {
      return {
        error: {
          ...response.error,
          status: response.error.status || 400
        }
      };
    }

    return {
      data: undefined,
      status: 200
    };
  }

  // Card methods
  async createCard(
    dashboardId: string,
    columnId: string,
    title: string
  ): Promise<ApiResponse<Card>> {
    const response = await this.request<Card>(
      `/dashboards/${dashboardId}/columns/${columnId}/cards`,
      {
        method: 'POST',
        body: JSON.stringify({ title }),
      }
    );

    if (response.error) {
      return {
        error: {
          ...response.error,
          status: response.error.status || 400
        }
      };
    }

    return {
      data: response.data,
      status: 201
    };
  }

  async updateCard(
    dashboardId: string,
    columnId: string,
    cardId: string,
    data: Partial<Card>
  ): Promise<ApiResponse<Card>> {
    const response = await this.request<Card>(
      `/dashboards/${dashboardId}/columns/${columnId}/cards/${cardId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );

    if (response.error) {
      return {
        error: {
          ...response.error,
          status: response.error.status || 400
        }
      };
    }

    return {
      data: response.data,
      status: 200
    };
  }

  async deleteCard(
    dashboardId: string,
    columnId: string,
    cardId: string
  ): Promise<ApiResponse<void>> {
    const response = await this.request<void>(
      `/dashboards/${dashboardId}/columns/${columnId}/cards/${cardId}`,
      {
        method: 'DELETE',
      }
    );

    if (response.error) {
      return {
        error: {
          ...response.error,
          status: response.error.status || 400
        }
      };
    }

    return {
      data: undefined,
      status: 200
    };
  }

  async moveCard(
    dashboardId: string,
    fromColumnId: string,
    toColumnId: string,
    cardId: string,
    newIndex: number
  ): Promise<ApiResponse<void>> {
    const response = await this.request<void>(
      `/dashboards/${dashboardId}/cards/${cardId}/move`,
      {
        method: 'PUT',
        body: JSON.stringify({
          fromColumnId,
          toColumnId,
          newIndex,
        }),
      }
    );

    if (response.error) {
      return {
        error: {
          ...response.error,
          status: response.error.status || 400
        }
      };
    }

    return {
      data: undefined,
      status: 200
    };
  }
}