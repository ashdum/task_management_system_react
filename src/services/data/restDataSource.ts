// src/services/data/restDataSource.ts
import { DataSource } from './types';
import { ApiResponse, AuthResponse, Dashboard, DashboardInvitation, Card, Column } from '../../types';
import ApiClient from '../api/apiClient';

export class RestDataSource implements DataSource {
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const response = await ApiClient.post<AuthResponse>('/auth/login', { email, password });
    if (response.data) {
      ApiClient.setAuthToken(response.data.accessToken);
    }
    return response;
  }

  async register(email: string, password: string, fullName: string): Promise<ApiResponse<AuthResponse>> {
    const response = await ApiClient.post<AuthResponse>('/auth/register', { email, password, fullName });
    if (response.data) {
      ApiClient.setAuthToken(response.data.accessToken);
    }
    return response;
  }

  async logout(): Promise<ApiResponse<any>> {
    const response = await ApiClient.post('/auth/logout', {});
    ApiClient.clearAuthToken();
    return response;
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<ApiResponse<AuthResponse>> {
    const response = await ApiClient.post<AuthResponse>('/auth/change-password', { userId, oldPassword, newPassword });
    if (response.data) {
      ApiClient.setAuthToken(response.data.accessToken);
    }
    return response;
  }

  async getDashboards(): Promise<ApiResponse<Dashboard[]>> {
    return ApiClient.get<Dashboard[]>('/dashboards');
  }

  async getDashboard(id: string): Promise<ApiResponse<Dashboard>> {
    return ApiClient.get<Dashboard>(`/dashboards/${id}`);
  }

  async createDashboard(title: string, userId: string): Promise<ApiResponse<Dashboard>> {
    return ApiClient.post<Dashboard>('/dashboards', { title, userId });
  }

  async updateDashboard(id: string, data: Partial<Dashboard>): Promise<ApiResponse<Dashboard>> {
    return ApiClient.put<Dashboard>(`/dashboards/${id}`, data);
  }

  async deleteDashboard(id: string): Promise<ApiResponse<void>> {
    return ApiClient.delete<void>(`/dashboards/${id}`);
  }

  async inviteToDashboard(dashboardId: string, email: string): Promise<ApiResponse<DashboardInvitation>> {
    return ApiClient.post<DashboardInvitation>(`/dashboards/${dashboardId}/invitations`, { email });
  }

  async acceptInvitation(invitationId: string): Promise<ApiResponse<void>> {
    return ApiClient.post<void>(`/invitations/${invitationId}/accept`, {});
  }

  async rejectInvitation(invitationId: string): Promise<ApiResponse<void>> {
    return ApiClient.post<void>(`/invitations/${invitationId}/reject`, {});
  }

  async createColumn(dashboardId: string, title: string): Promise<ApiResponse<Column>> {
    return ApiClient.post<Column>('/columns', { dashboardId, title });
  }

  async updateColumn(dashboardId: string, columnId: string, data: Partial<Column>): Promise<ApiResponse<Column>> {
    return ApiClient.put<Column>(`/columns/${columnId}`, { ...data, dashboardId });
  }

  async deleteColumn(dashboardId: string, columnId: string): Promise<ApiResponse<void>> {
    return ApiClient.delete<void>(`/columns/${columnId}`);
  }

  async updateColumnOrder(dashboardId: string, columnIds: string[]): Promise<ApiResponse<void>> {
    return ApiClient.put<void>(`/dashboards/${dashboardId}/columns/order`, { columnIds });
  }

  async createCard(dashboardId: string, columnId: string, title: string): Promise<ApiResponse<Card>> {
    return ApiClient.post<Card>('/cards', { dashboardId, columnId, title });
  }

  async updateCard(dashboardId: string, columnId: string, cardId: string, data: Partial<Card>): Promise<ApiResponse<Card>> {
    return ApiClient.put<Card>(`/cards/${cardId}`, { ...data, dashboardId, columnId });
  }

  async deleteCard(dashboardId: string, columnId: string, cardId: string): Promise<ApiResponse<void>> {
    return ApiClient.delete<void>(`/cards/${cardId}`);
  }

  async moveCard(dashboardId: string, fromColumnId: string, toColumnId: string, cardId: string, newIndex: number): Promise<ApiResponse<void>> {
    return ApiClient.put<void>(`/cards/${cardId}/move`, { dashboardId, fromColumnId, toColumnId, newIndex });
  }

  // Метод для Google OAuth
  async googleLogin(credential: string): Promise<ApiResponse<AuthResponse>> {
    const response = await ApiClient.post<AuthResponse>('/auth/google', { credential });
    if (response.data) {
      ApiClient.setAuthToken(response.data.accessToken);
    }
    return response;
  }

  // Метод для GitHub OAuth
  async githubCallback(code: string): Promise<ApiResponse<AuthResponse>> {
    console.log('githubCallback code:', code);
    const response = await ApiClient.post<AuthResponse>('/auth/github/callback', { code });
    console.log('githubCallback response:', response);
    if (response.data) {
      ApiClient.setAuthToken(response.data.accessToken);
    }
    return response;
  }
}