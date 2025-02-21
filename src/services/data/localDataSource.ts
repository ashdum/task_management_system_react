// src/services/data/localDataSource.ts
// LocalDataSource implementation using storageManager for testing

import { storageManager } from '../storage/storageManager';
import { v4 as uuidv4 } from 'uuid';
import type {
  User,
  Dashboard,
  Card,
  Column,
  DashboardInvitation,
  ApiResponse,
  AuthResponse,
} from '../../types';
import { DataSource } from './types';

export class LocalDataSource implements DataSource {
  // Login implementation using localStorage as user storage
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    await storageManager.simulateLatency();
    const usersStr = localStorage.getItem('users');
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];
    const user = users.find(u => u.email === email);
    if (!user) {
      return {
        error: {
          message: 'User not found',
          code: 'NOT_FOUND',
          status: 404,
        },
      };
    }
    const storedPassword = localStorage.getItem(`password_${user.id}`);
    if (storedPassword !== password) {
      return {
        error: {
          message: 'Invalid credentials',
          code: 'AUTH_ERROR',
          status: 401,
        },
      };
    }
    localStorage.setItem('mockUser', JSON.stringify(user));

    // For demo purposes, using static tokens
    // Generate access token (expires in 1 hour) and refresh token (expires in 7 days)
    const accessToken = this.generateToken(user, 3600);
    const refreshToken = this.generateToken(user, 604800);

    const authResponse: AuthResponse = { ...user, accessToken: accessToken, refreshToken };
    return { data: authResponse, status: 201 };
  }

  // Register implementation: creates new user and generates tokens
  async register(email: string, password: string, fullName: string): Promise<ApiResponse<AuthResponse>> {
    await storageManager.simulateLatency();
    const usersStr = localStorage.getItem('users');
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];
    if (users.find(u => u.email === email)) {
      return {
        error: {
          message: 'User already exists',
          code: 'CONFLICT',
          status: 409,
        },
      };
    }
    const newUser: User = {
      id: uuidv4(),
      email,
      fullName,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem(`password_${newUser.id}`, password);
    localStorage.setItem('mockUser', JSON.stringify(newUser));

    // Generate access token (expires in 1 hour) and refresh token (expires in 7 days)
    const accessToken = this.generateToken(newUser, 3600);
    const refreshToken = this.generateToken(newUser, 604800);

    const authResponse: AuthResponse = { ...newUser, accessToken: accessToken, refreshToken };
    return { data: authResponse, status: 201 };
  }

  async logout(): Promise<ApiResponse<any>> {
    await storageManager.simulateLatency();
    localStorage.removeItem('mockUser');
    return { data: null, status: 200 };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<ApiResponse<any>> {
    await storageManager.simulateLatency();
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === userId);
    if (!user) {
      return { error: { message: 'User not found', code: 'NOT_FOUND', status: 404 } };
    }
    const storedPassword = localStorage.getItem(`password_${userId}`);
    if (storedPassword !== oldPassword) {
      return { error: { message: 'Old password does not match', code: 'INVALID_PASSWORD', status: 400 } };
    }
    localStorage.setItem(`password_${userId}`, newPassword);
    return { data: { success: true }, status: 200 };
  }

  async getDashboards(): Promise<ApiResponse<Dashboard[]>> {
    await storageManager.simulateLatency();
    const currentUser = JSON.parse(localStorage.getItem('mockUser') || '{}');
    if (!currentUser.id) {
      return {
        error: {
          message: 'User not authenticated',
          code: 'AUTH_ERROR',
          status: 401,
        },
      };
    }
    const data = storageManager.getData();
    return { data: data.dashboards, status: 200 };
  }

  async getDashboard(id: string): Promise<ApiResponse<Dashboard>> {
    await storageManager.simulateLatency();
    const data = storageManager.getData();
    const dashboard = data.dashboards.find(d => d.id === id);
    if (!dashboard) {
      return {
        error: {
          message: 'Dashboard not found',
          code: 'NOT_FOUND',
          status: 404,
        },
      };
    }
    return { data: dashboard, status: 200 };
  }

  async createDashboard(title: string, userId: string): Promise<ApiResponse<Dashboard>> {
    await storageManager.simulateLatency();
    if (!title?.trim()) {
      return {
        error: {
          message: 'Dashboard title is required',
          code: 'VALIDATION_ERROR',
          status: 400,
        },
      };
    }
    const currentUser = JSON.parse(localStorage.getItem('mockUser') || '{}');
    if (!currentUser.id) {
      return {
        error: {
          message: 'User not authenticated',
          code: 'AUTH_ERROR',
          status: 401,
        },
      };
    }
    const data = storageManager.getData();
    const dashboard: Dashboard = {
      id: `dashboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      ownerIds: [userId],
      members: [currentUser],
      createdAt: new Date().toISOString(),
      columns: [
        { id: `column_${Date.now()}_1`, title: 'To Do', order: 0, cards: [] },
        { id: `column_${Date.now()}_2`, title: 'In Progress', order: 1, cards: [] },
        { id: `column_${Date.now()}_3`, title: 'Done', order: 2, cards: [] },
      ],
    };
    data.dashboards.push(dashboard);
    storageManager.setData(data);
    return { data: dashboard, status: 201 };
  }

  async updateDashboard(id: string, updates: Partial<Dashboard>): Promise<ApiResponse<Dashboard>> {
    await storageManager.simulateLatency();
    const data = storageManager.getData();
    const index = data.dashboards.findIndex(d => d.id === id);
    if (index === -1) {
      return {
        error: {
          message: 'Dashboard not found',
          code: 'NOT_FOUND',
          status: 404,
        },
      };
    }
    const updatedDashboard = { ...data.dashboards[index], ...updates };
    data.dashboards[index] = updatedDashboard;
    storageManager.setData(data);
    return { data: updatedDashboard, status: 200 };
  }

  async deleteDashboard(id: string): Promise<ApiResponse<void>> {
    await storageManager.simulateLatency();
    const data = storageManager.getData();
    const index = data.dashboards.findIndex(d => d.id === id);
    if (index === -1) {
      return {
        error: {
          message: 'Dashboard not found',
          code: 'NOT_FOUND',
          status: 404,
        },
      };
    }
    data.dashboards.splice(index, 1);
    storageManager.setData(data);
    return { data: undefined, status: 200 };
  }

  async createColumn(dashboardId: string, title: string): Promise<ApiResponse<Column>> {
    await storageManager.simulateLatency();
    const data = storageManager.getData();
    const dashboard = data.dashboards.find(d => d.id === dashboardId);
    if (!dashboard) {
      return {
        error: {
          message: 'Dashboard not found',
          code: 'NOT_FOUND',
          status: 404,
        },
      };
    }
    const column: Column = {
      id: `column_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      order: dashboard.columns.length,
      cards: [],
    };
    dashboard.columns.push(column);
    storageManager.setData(data);
    return { data: column, status: 201 };
  }

  async updateColumn(dashboardId: string, columnId: string, dataToUpdate: Partial<Column>): Promise<ApiResponse<Column>> {
    await storageManager.simulateLatency();
    const storageData = storageManager.getData();
    const dashboard = storageData.dashboards.find(d => d.id === dashboardId);
    if (!dashboard) {
      return {
        error: {
          message: 'Dashboard not found',
          code: 'NOT_FOUND',
          status: 404,
        },
      };
    }
    const column = dashboard.columns.find(c => c.id === columnId);
    if (!column) {
      return {
        error: {
          message: 'Column not found',
          code: 'NOT_FOUND',
          status: 404,
        },
      };
    }
    Object.assign(column, dataToUpdate);
    storageManager.setData(storageData);
    return { data: column, status: 200 };
  }

  async deleteColumn(dashboardId: string, columnId: string): Promise<ApiResponse<void>> {
    await storageManager.simulateLatency();
    const storageData = storageManager.getData();
    const dashboard = storageData.dashboards.find(d => d.id === dashboardId);
    if (!dashboard) {
      return {
        error: {
          message: 'Dashboard not found',
          code: 'NOT_FOUND',
          status: 404,
        },
      };
    }
    const columnIndex = dashboard.columns.findIndex(c => c.id === columnId);
    if (columnIndex === -1) {
      return {
        error: {
          message: 'Column not found',
          code: 'NOT_FOUND',
          status: 404,
        },
      };
    }
    dashboard.columns.splice(columnIndex, 1);
    storageManager.setData(storageData);
    return { data: undefined, status: 200 };
  }

  async updateColumnOrder(dashboardId: string, columnIds: string[]): Promise<ApiResponse<void>> {
    await storageManager.simulateLatency();
    const data = storageManager.getData();
    const dashboard = data.dashboards.find(d => d.id === dashboardId);
    if (!dashboard) {
      return {
        error: {
          message: 'Dashboard not found',
          code: 'NOT_FOUND',
          status: 404,
        },
      };
    }
    dashboard.columns = columnIds.map((id, index) => {
      const column = dashboard.columns.find(c => c.id === id);
      if (!column) throw new Error('Column not found');
      return { ...column, order: index };
    });
    storageManager.setData(data);
    return { data: undefined, status: 200 };
  }

  async createCard(dashboardId: string, columnId: string, title: string): Promise<ApiResponse<Card>> {
    await storageManager.simulateLatency();
    const data = storageManager.getData();
    const dashboard = data.dashboards.find(d => d.id === dashboardId);
    if (!dashboard) {
      return {
        error: {
          message: 'Dashboard not found',
          code: 'NOT_FOUND',
          status: 404,
        },
      };
    }
    const column = dashboard.columns.find(c => c.id === columnId);
    if (!column) {
      return {
        error: {
          message: 'Column not found',
          code: 'NOT_FOUND',
          status: 404,
        },
      };
    }
    const card: Card = {
      id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      number: Date.now(),
      title,
      columnId,
      description: '',
      members: [],
      labels: [],
      checklists: [],
      comments: [],
    };
    column.cards.push(card);
    storageManager.setData(data);
    return { data: card, status: 201 };
  }

  async updateCard(
    dashboardId: string,
    columnId: string,
    cardId: string,
    updates: Partial<Card>
  ): Promise<ApiResponse<Card>> {
    await storageManager.simulateLatency();
    const data = storageManager.getData();
    const dashboard = data.dashboards.find(d => d.id === dashboardId);
    if (!dashboard) {
      return {
        error: {
          message: 'Dashboard not found',
          code: 'NOT_FOUND',
          status: 404,
        },
      };
    }
    const column = dashboard.columns.find(c => c.id === columnId);
    if (!column) {
      return {
        error: {
          message: 'Column not found',
          code: 'NOT_FOUND',
          status: 404,
        },
      };
    }
    const cardIndex = column.cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      return {
        error: {
          message: 'Card not found',
          code: 'NOT_FOUND',
          status: 404,
        },
      };
    }
    const updatedCard = { ...column.cards[cardIndex], ...updates };
    column.cards[cardIndex] = updatedCard;
    storageManager.setData(data);
    return { data: updatedCard, status: 200 };
  }

  async deleteCard(dashboardId: string, columnId: string, cardId: string): Promise<ApiResponse<void>> {
    await storageManager.simulateLatency();
    const data = storageManager.getData();
    const dashboard = data.dashboards.find(d => d.id === dashboardId);
    if (!dashboard) {
      return {
        error: {
          message: 'Dashboard not found',
          code: 'NOT_FOUND',
          status: 404,
        },
      };
    }
    const column = dashboard.columns.find(c => c.id === columnId);
    if (!column) {
      return {
        error: {
          message: 'Column not found',
          code: 'NOT_FOUND',
          status: 404,
        },
      };
    }
    const cardIndex = column.cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      return {
        error: {
          message: 'Card not found',
          code: 'NOT_FOUND',
          status: 404,
        },
      };
    }
    column.cards.splice(cardIndex, 1);
    storageManager.setData(data);
    return { data: undefined, status: 200 };
  }

  async moveCard(
    dashboardId: string,
    fromColumnId: string,
    toColumnId: string,
    cardId: string,
    newIndex: number
  ): Promise<ApiResponse<void>> {
    await storageManager.simulateLatency();
    const data = storageManager.getData();
    const dashboard = data.dashboards.find(d => d.id === dashboardId);
    if (!dashboard) {
      return {
        error: {
          message: 'Dashboard not found',
          code: 'NOT_FOUND',
          status: 404,
        },
      };
    }
    const fromColumn = dashboard.columns.find(c => c.id === fromColumnId);
    const toColumn = dashboard.columns.find(c => c.id === toColumnId);
    if (!fromColumn || !toColumn) {
      return {
        error: {
          message: 'Column not found',
          code: 'NOT_FOUND',
          status: 404,
        },
      };
    }
    const cardIndex = fromColumn.cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      return {
        error: {
          message: 'Card not found',
          code: 'NOT_FOUND',
          status: 404,
        },
      };
    }
    const [card] = fromColumn.cards.splice(cardIndex, 1);
    toColumn.cards.splice(newIndex, 0, { ...card, columnId: toColumnId });
    storageManager.setData(data);
    return { data: undefined, status: 200 };
  }

  async inviteToDashboard(dashboardId: string, email: string): Promise<ApiResponse<DashboardInvitation>> {
    await storageManager.simulateLatency();
    const data = storageManager.getData();
    const currentUser = JSON.parse(localStorage.getItem('mockUser') || '{}');
    const dashboard = data.dashboards.find(d => d.id === dashboardId);
    if (!dashboard) {
      return {
        error: {
          message: 'Dashboard not found',
          code: 'NOT_FOUND',
          status: 404,
        },
      };
    }
    const invitation: DashboardInvitation = {
      id: `invitation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      dashboardId,
      inviterId: currentUser.id,
      inviterEmail: currentUser.email,
      inviteeEmail: email,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    if (!dashboard.invitations) {
      dashboard.invitations = [];
    }
    dashboard.invitations.push(invitation);
    storageManager.setData(data);
    return { data: invitation, status: 201 };
  }

  async acceptInvitation(invitationId: string): Promise<ApiResponse<void>> {
    await storageManager.simulateLatency();
    const data = storageManager.getData();
    const currentUser = JSON.parse(localStorage.getItem('mockUser') || '{}');
    for (const dashboard of data.dashboards) {
      const invitation = dashboard.invitations?.find(i => i.id === invitationId);
      if (invitation && invitation.inviteeEmail === currentUser.email) {
        invitation.status = 'accepted';
        if (!dashboard.members.some(m => m.id === currentUser.id)) {
          dashboard.members.push(currentUser);
        }
        storageManager.setData(data);
        return { data: undefined, status: 200 };
      }
    }
    return { error: { message: 'Invitation not found', code: 'NOT_FOUND', status: 404 } };
  }

  async rejectInvitation(invitationId: string): Promise<ApiResponse<void>> {
    await storageManager.simulateLatency();
    const data = storageManager.getData();
    const currentUser = JSON.parse(localStorage.getItem('mockUser') || '{}');
    for (const dashboard of data.dashboards) {
      const invitation = dashboard.invitations?.find(i => i.id === invitationId);
      if (invitation && invitation.inviteeEmail === currentUser.email) {
        invitation.status = 'rejected';
        storageManager.setData(data);
        return { data: undefined, status: 200 };
      }
    }
    return { error: { message: 'Invitation not found', code: 'NOT_FOUND', status: 404 } };
  }

  generateToken(user: User, expiresInSeconds: number): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      sub: user.id,
      email: user.email,
      exp: now + expiresInSeconds,
      iat: now,
      user, // embedding the whole user object
    };
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = 'local-signature';
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }
}
