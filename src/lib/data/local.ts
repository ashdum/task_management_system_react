import { storage } from '../api/storage';
import type { DataSource } from './types';
import type {
  User,
  Dashboard,
  Card,
  Column,
  DashboardInvitation,
  ApiResponse,
} from '../../types';

export class LocalDataSource implements DataSource {
  // Auth methods
  async login(email: string, password: string): Promise<ApiResponse<User>> {
    await storage.simulateLatency();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return {
        error: {
          message: 'User not found',
          code: 'AUTH_ERROR',
        },
      };
    }

    return { data: user };
  }

  async register(email: string, password: string): Promise<ApiResponse<User>> {
    await storage.simulateLatency();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.find((u: User) => u.email.toLowerCase() === email.toLowerCase())) {
      return {
        error: {
          message: 'User already exists',
          code: 'AUTH_ERROR',
        },
      };
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      fullName: email.split('@')[0],
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    return { data: newUser };
  }

  async logout(): Promise<void> {
    localStorage.removeItem('mockUser');
  }

  // Dashboard methods
  async getDashboards(): Promise<ApiResponse<Dashboard[]>> {
    await storage.simulateLatency();
    const currentUser = JSON.parse(localStorage.getItem('mockUser') || '{}');
    
    if (!currentUser.id) {
      return {
        error: {
          message: 'User not authenticated',
          code: 'AUTH_ERROR',
        },
      };
    }

    const data = storage.getData();
    return { data: data.dashboards };
  }

  async createDashboard(title: string, userId: string): Promise<ApiResponse<Dashboard>> {
    await storage.simulateLatency();
    const data = storage.getData();
    const currentUser = JSON.parse(localStorage.getItem('mockUser') || '{}');
    
    if (!currentUser.id) {
      return {
        error: {
          message: 'User not authenticated',
          code: 'AUTH_ERROR',
        },
      };
    }

    const dashboard: Dashboard = {
      id: `dashboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      ownerIds: [userId],
      members: [currentUser],
      createdAt: new Date().toISOString(),
      columns: [
        {
          id: `column_${Date.now()}_1`,
          title: 'To Do',
          order: 0,
          cards: [],
        },
        {
          id: `column_${Date.now()}_2`,
          title: 'In Progress',
          order: 1,
          cards: [],
        },
        {
          id: `column_${Date.now()}_3`,
          title: 'Done',
          order: 2,
          cards: [],
        },
      ],
    };

    data.dashboards.push(dashboard);
    storage.setData(data);
    return { data: dashboard };
  }

  async updateDashboard(id: string, updates: Partial<Dashboard>): Promise<ApiResponse<Dashboard>> {
    await storage.simulateLatency();
    const data = storage.getData();
    const index = data.dashboards.findIndex(d => d.id === id);
    
    if (index === -1) {
      return {
        error: {
          message: 'Dashboard not found',
          code: 'NOT_FOUND',
        },
      };
    }

    const updatedDashboard = {
      ...data.dashboards[index],
      ...updates,
    };

    data.dashboards[index] = updatedDashboard;
    storage.setData(data);
    return { data: updatedDashboard };
  }

  // Column methods
  async createColumn(dashboardId: string, title: string): Promise<ApiResponse<Column>> {
    await storage.simulateLatency();
    const data = storage.getData();
    const dashboard = data.dashboards.find(d => d.id === dashboardId);
    
    if (!dashboard) {
      return {
        error: {
          message: 'Dashboard not found',
          code: 'NOT_FOUND',
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
    storage.setData(data);
    return { data: column };
  }

  async updateColumnOrder(dashboardId: string, columnIds: string[]): Promise<ApiResponse<void>> {
    await storage.simulateLatency();
    const data = storage.getData();
    const dashboard = data.dashboards.find(d => d.id === dashboardId);
    
    if (!dashboard) {
      return {
        error: {
          message: 'Dashboard not found',
          code: 'NOT_FOUND',
        },
      };
    }

    dashboard.columns = columnIds.map((id, index) => {
      const column = dashboard.columns.find(c => c.id === id);
      if (!column) throw new Error('Column not found');
      return { ...column, order: index };
    });

    storage.setData(data);
    return { data: undefined };
  }

  // Card methods
  async createCard(dashboardId: string, columnId: string, title: string): Promise<ApiResponse<Card>> {
    await storage.simulateLatency();
    const data = storage.getData();
    const dashboard = data.dashboards.find(d => d.id === dashboardId);
    
    if (!dashboard) {
      return {
        error: {
          message: 'Dashboard not found',
          code: 'NOT_FOUND',
        },
      };
    }

    const column = dashboard.columns.find(c => c.id === columnId);
    if (!column) {
      return {
        error: {
          message: 'Column not found',
          code: 'NOT_FOUND',
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
    storage.setData(data);
    return { data: card };
  }

  async updateCard(
    dashboardId: string,
    columnId: string,
    cardId: string,
    updates: Partial<Card>
  ): Promise<ApiResponse<Card>> {
    await storage.simulateLatency();
    const data = storage.getData();
    const dashboard = data.dashboards.find(d => d.id === dashboardId);
    
    if (!dashboard) {
      return {
        error: {
          message: 'Dashboard not found',
          code: 'NOT_FOUND',
        },
      };
    }

    const column = dashboard.columns.find(c => c.id === columnId);
    if (!column) {
      return {
        error: {
          message: 'Column not found',
          code: 'NOT_FOUND',
        },
      };
    }

    const cardIndex = column.cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      return {
        error: {
          message: 'Card not found',
          code: 'NOT_FOUND',
        },
      };
    }

    const updatedCard = {
      ...column.cards[cardIndex],
      ...updates,
    };

    column.cards[cardIndex] = updatedCard;
    storage.setData(data);
    return { data: updatedCard };
  }

  async moveCard(
    dashboardId: string,
    fromColumnId: string,
    toColumnId: string,
    cardId: string,
    newIndex: number
  ): Promise<ApiResponse<void>> {
    await storage.simulateLatency();
    const data = storage.getData();
    const dashboard = data.dashboards.find(d => d.id === dashboardId);
    
    if (!dashboard) {
      return {
        error: {
          message: 'Dashboard not found',
          code: 'NOT_FOUND',
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
        },
      };
    }

    const cardIndex = fromColumn.cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      return {
        error: {
          message: 'Card not found',
          code: 'NOT_FOUND',
        },
      };
    }

    const [card] = fromColumn.cards.splice(cardIndex, 1);
    toColumn.cards.splice(newIndex, 0, { ...card, columnId: toColumnId });
    storage.setData(data);
    return { data: undefined };
  }

  // Dashboard invitation methods
  async inviteToDashboard(
    dashboardId: string,
    email: string
  ): Promise<ApiResponse<DashboardInvitation>> {
    await storage.simulateLatency();
    const data = storage.getData();
    const currentUser = JSON.parse(localStorage.getItem('mockUser') || '{}');
    const dashboard = data.dashboards.find(d => d.id === dashboardId);

    if (!dashboard) {
      return {
        error: {
          message: 'Dashboard not found',
          code: 'NOT_FOUND',
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
    storage.setData(data);
    return { data: invitation };
  }

  async acceptInvitation(invitationId: string): Promise<ApiResponse<void>> {
    await storage.simulateLatency();
    const data = storage.getData();
    const currentUser = JSON.parse(localStorage.getItem('mockUser') || '{}');

    for (const dashboard of data.dashboards) {
      const invitation = dashboard.invitations?.find(i => i.id === invitationId);
      if (invitation && invitation.inviteeEmail === currentUser.email) {
        invitation.status = 'accepted';
        if (!dashboard.members.some(m => m.id === currentUser.id)) {
          dashboard.members.push(currentUser);
        }
        storage.setData(data);
        return { data: undefined };
      }
    }

    return {
      error: {
        message: 'Invitation not found',
        code: 'NOT_FOUND',
      },
    };
  }

  async rejectInvitation(invitationId: string): Promise<ApiResponse<void>> {
    await storage.simulateLatency();
    const data = storage.getData();
    const currentUser = JSON.parse(localStorage.getItem('mockUser') || '{}');

    for (const dashboard of data.dashboards) {
      const invitation = dashboard.invitations?.find(i => i.id === invitationId);
      if (invitation && invitation.inviteeEmail === currentUser.email) {
        invitation.status = 'rejected';
        storage.setData(data);
        return { data: undefined };
      }
    }

    return {
      error: {
        message: 'Invitation not found',
        code: 'NOT_FOUND',
      },
    };
  }
}