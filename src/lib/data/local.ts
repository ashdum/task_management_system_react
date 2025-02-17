import { storage } from '../api/storage';
import type { DataSource } from './types';
import type {
  User,
  Dashboard,
  Card,
  Column,
  DashboardInvitation,
  ApiResponse,
  AuthResponse,
} from '../../types';

export class LocalDataSource implements DataSource {
  async getDashboard(id: string): Promise<ApiResponse<Dashboard>> {
    try {
      await storage.simulateLatency();
      const data = storage.getData();
      const dashboard = data.dashboards.find(d => d.id === id);
      
      if (!dashboard) {
        return {
          error: {
            message: 'Dashboard not found',
            code: 'NOT_FOUND',
            status: 404
          }
        };
      }

      return { 
        data: dashboard,
        status: 200
      };
    } catch (error) {
      return {
        error: {
          message: 'Failed to fetch dashboard',
          code: 'INTERNAL_ERROR',
          status: 500
        }
      };
    }
  }

  async deleteDashboard(id: string): Promise<ApiResponse<void>> {
    try {
      await storage.simulateLatency();
      const data = storage.getData();
      const index = data.dashboards.findIndex(d => d.id === id);
      
      if (index === -1) {
        return {
          error: {
            message: 'Dashboard not found',
            code: 'NOT_FOUND',
            status: 404
          }
        };
      }

      data.dashboards.splice(index, 1);
      storage.setData(data);
      return { 
        data: undefined,
        status: 200
      };
    } catch (error) {
      return {
        error: {
          message: 'Failed to delete dashboard',
          code: 'INTERNAL_ERROR',
          status: 500
        }
      };
    }
  }
  // Auth methods
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    try {
      await storage.simulateLatency();
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        return {
          error: {
            message: 'Invalid email or password',
            code: 'AUTH_ERROR',
            status: 401
          }
        };
      }

      // In a real app, this would be a proper password hash comparison
      const storedPassword = localStorage.getItem(`password_${user.id}`);
      if (storedPassword !== password) {
        return {
          error: {
            message: 'Invalid email or password',
            code: 'AUTH_ERROR',
            status: 401
          }
        };
      }

      const authResponse: AuthResponse = {
        ...user,
        token: 'mockToken', // In a real app, generate a proper token
      };
      return { 
        data: authResponse,
        status: 200
      };
    } catch (error) {
      return {
        error: {
          message: 'An unexpected error occurred',
          code: 'INTERNAL_ERROR',
          status: 500
        }
      };
    }
  }

  async register(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    try {
      await storage.simulateLatency();
      
      if (!email || !password) {
        return {
          error: {
            message: 'Email and password are required',
            code: 'VALIDATION_ERROR',
            status: 400
          }
        };
      }

      if (password.length < 6) {
        return {
          error: {
            message: 'Password must be at least 6 characters long',
            code: 'VALIDATION_ERROR',
            status: 400
          }
        };
      }

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      if (users.find((u: User) => u.email.toLowerCase() === email.toLowerCase())) {
        return {
          error: {
            message: 'User already exists',
            code: 'AUTH_ERROR',
            status: 409
          }
        };
      }

      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        fullName: email.split('@')[0],
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem(`password_${newUser.id}`, password); // In real app, this would be hashed

      const authResponse: AuthResponse = {
        ...newUser,
        token: 'mockToken', // In a real app, generate a proper token
      };
      return { 
        data: authResponse,
        status: 201 
      };
    } catch (error) {
      return {
        error: {
          message: 'An unexpected error occurred',
          code: 'INTERNAL_ERROR',
          status: 500
        }
      };
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem('mockUser');
  }

  // Dashboard methods
  async getDashboards(): Promise<ApiResponse<Dashboard[]>> {
    try {
      await storage.simulateLatency();
      const currentUser = JSON.parse(localStorage.getItem('mockUser') || '{}');
      
      if (!currentUser.id) {
        return {
          error: {
            message: 'User not authenticated',
            code: 'AUTH_ERROR',
            status: 401
          }
        };
      }

      const data = storage.getData();
      return { 
        data: data.dashboards,
        status: 200
      };
    } catch (error) {
      return {
        error: {
          message: 'Failed to fetch dashboards',
          code: 'INTERNAL_ERROR',
          status: 500
        }
      };
    }
  }

  async createDashboard(title: string, userId: string): Promise<ApiResponse<Dashboard>> {
    try {
      await storage.simulateLatency();
      
      if (!title?.trim()) {
        return {
          error: {
            message: 'Dashboard title is required',
            code: 'VALIDATION_ERROR',
            status: 400
          }
        };
      }

      const currentUser = JSON.parse(localStorage.getItem('mockUser') || '{}');
      if (!currentUser.id) {
        return {
          error: {
            message: 'User not authenticated',
            code: 'AUTH_ERROR',
            status: 401
          }
        };
      }

      const data = storage.getData();
      const dashboard: Dashboard = {
        id: `dashboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: title.trim(),
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
      return { 
        data: dashboard,
        status: 201
      };
    } catch (error) {
      return {
        error: {
          message: 'Failed to create dashboard',
          code: 'INTERNAL_ERROR',
          status: 500
        }
      };
    }
  }

  async updateDashboard(id: string, updates: Partial<Dashboard>): Promise<ApiResponse<Dashboard>> {
    try {
      await storage.simulateLatency();
      const data = storage.getData();
      const index = data.dashboards.findIndex(d => d.id === id);
      
      if (index === -1) {
        return {
          error: {
            message: 'Dashboard not found',
            code: 'NOT_FOUND',
            status: 404
          }
        };
      }

      const updatedDashboard = {
        ...data.dashboards[index],
        ...updates,
      };

      data.dashboards[index] = updatedDashboard;
      storage.setData(data);
      return { 
        data: updatedDashboard,
        status: 200
      };
    } catch (error) {
      return {
        error: {
          message: 'Failed to update dashboard',
          code: 'INTERNAL_ERROR',
          status: 500
        }
      };
    }
  }

  // Column methods
  async createColumn(dashboardId: string, title: string): Promise<ApiResponse<Column>> {
    try {
      await storage.simulateLatency();
      const data = storage.getData();
      const dashboard = data.dashboards.find(d => d.id === dashboardId);
      
      if (!dashboard) {
        return {
          error: {
            message: 'Dashboard not found',
            code: 'NOT_FOUND',
            status: 404
          }
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
      return { 
        data: column,
        status: 201
      };
    } catch (error) {
      return {
        error: {
          message: 'Failed to create column',
          code: 'INTERNAL_ERROR',
          status: 500
        }
      };
    }
  }

  async updateColumnOrder(dashboardId: string, columnIds: string[]): Promise<ApiResponse<void>> {
    try {
      await storage.simulateLatency();
      const data = storage.getData();
      const dashboard = data.dashboards.find(d => d.id === dashboardId);
      
      if (!dashboard) {
        return {
          error: {
            message: 'Dashboard not found',
            code: 'NOT_FOUND',
            status: 404
          }
        };
      }

      dashboard.columns = columnIds.map((id, index) => {
        const column = dashboard.columns.find(c => c.id === id);
        if (!column) throw new Error('Column not found');
        return { ...column, order: index };
      });

      storage.setData(data);
      return { 
        data: undefined,
        status: 200
      };
    } catch (error) {
      return {
        error: {
          message: 'Failed to update column order',
          code: 'INTERNAL_ERROR',
          status: 500
        }
      };
    }
  }

  // Card methods
  async createCard(dashboardId: string, columnId: string, title: string): Promise<ApiResponse<Card>> {
    try {
      await storage.simulateLatency();
      const data = storage.getData();
      const dashboard = data.dashboards.find(d => d.id === dashboardId);
      
      if (!dashboard) {
        return {
          error: {
            message: 'Dashboard not found',
            code: 'NOT_FOUND',
            status: 404
          }
        };
      }

      const column = dashboard.columns.find(c => c.id === columnId);
      if (!column) {
        return {
          error: {
            message: 'Column not found',
            code: 'NOT_FOUND',
            status: 404
          }
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
      return { 
        data: card,
        status: 201
      };
    } catch (error) {
      return {
        error: {
          message: 'Failed to create card',
          code: 'INTERNAL_ERROR',
          status: 500
        }
      };
    }
  }

  async updateCard(
    dashboardId: string,
    columnId: string,
    cardId: string,
    updates: Partial<Card>
  ): Promise<ApiResponse<Card>> {
    try {
      await storage.simulateLatency();
      const data = storage.getData();
      const dashboard = data.dashboards.find(d => d.id === dashboardId);
      
      if (!dashboard) {
        return {
          error: {
            message: 'Dashboard not found',
            code: 'NOT_FOUND',
            status: 404
          }
        };
      }

      const column = dashboard.columns.find(c => c.id === columnId);
      if (!column) {
        return {
          error: {
            message: 'Column not found',
            code: 'NOT_FOUND',
            status: 404
          }
        };
      }

      const cardIndex = column.cards.findIndex(c => c.id === cardId);
      if (cardIndex === -1) {
        return {
          error: {
            message: 'Card not found',
            code: 'NOT_FOUND',
            status: 404
          }
        };
      }

      const updatedCard = {
        ...column.cards[cardIndex],
        ...updates,
      };

      column.cards[cardIndex] = updatedCard;
      storage.setData(data);
      return { 
        data: updatedCard,
        status: 200
      };
    } catch (error) {
      return {
        error: {
          message: 'Failed to update card',
          code: 'INTERNAL_ERROR',
          status: 500
        }
      };
    }
  }

  async moveCard(
    dashboardId: string,
    fromColumnId: string,
    toColumnId: string,
    cardId: string,
    newIndex: number
  ): Promise<ApiResponse<void>> {
    try {
      await storage.simulateLatency();
      const data = storage.getData();
      const dashboard = data.dashboards.find(d => d.id === dashboardId);
      
      if (!dashboard) {
        return {
          error: {
            message: 'Dashboard not found',
            code: 'NOT_FOUND',
            status: 404
          }
        };
      }

      const fromColumn = dashboard.columns.find(c => c.id === fromColumnId);
      const toColumn = dashboard.columns.find(c => c.id === toColumnId);
      
      if (!fromColumn || !toColumn) {
        return {
          error: {
            message: 'Column not found',
            code: 'NOT_FOUND',
            status: 404
          }
        };
      }

      const cardIndex = fromColumn.cards.findIndex(c => c.id === cardId);
      if (cardIndex === -1) {
        return {
          error: {
            message: 'Card not found',
            code: 'NOT_FOUND',
            status: 404
          }
        };
      }

      const [card] = fromColumn.cards.splice(cardIndex, 1);
      toColumn.cards.splice(newIndex, 0, { ...card, columnId: toColumnId });
      storage.setData(data);
      return { 
        data: undefined,
        status: 200
      };
    } catch (error) {
      return {
        error: {
          message: 'Failed to move card',
          code: 'INTERNAL_ERROR',
          status: 500
        }
      };
    }
  }

  // Dashboard invitation methods
  async inviteToDashboard(
    dashboardId: string,
    email: string
  ): Promise<ApiResponse<DashboardInvitation>> {
    try {
      await storage.simulateLatency();
      const data = storage.getData();
      const currentUser = JSON.parse(localStorage.getItem('mockUser') || '{}');
      const dashboard = data.dashboards.find(d => d.id === dashboardId);

      if (!dashboard) {
        return {
          error: {
            message: 'Dashboard not found',
            code: 'NOT_FOUND',
            status: 404
          }
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
      return { 
        data: invitation,
        status: 201
      };
    } catch (error) {
      return {
        error: {
          message: 'Failed to invite to dashboard',
          code: 'INTERNAL_ERROR',
          status: 500
        }
      };
    }
  }

  async acceptInvitation(invitationId: string): Promise<ApiResponse<void>> {
    try {
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
          return { 
            data: undefined,
            status: 200
          };
        }
      }

      return {
        error: {
          message: 'Invitation not found',
          code: 'NOT_FOUND',
          status: 404
        }
      };
    } catch (error) {
      return {
        error: {
          message: 'Failed to accept invitation',
          code: 'INTERNAL_ERROR',
          status: 500
        }
      };
    }
  }

  async rejectInvitation(invitationId: string): Promise<ApiResponse<void>> {
    try {
      await storage.simulateLatency();
      const data = storage.getData();
      const currentUser = JSON.parse(localStorage.getItem('mockUser') || '{}');

      for (const dashboard of data.dashboards) {
        const invitation = dashboard.invitations?.find(i => i.id === invitationId);
        if (invitation && invitation.inviteeEmail === currentUser.email) {
          invitation.status = 'rejected';
          storage.setData(data);
          return { 
            data: undefined,
            status: 200
          };
        }
      }

      return {
        error: {
          message: 'Invitation not found',
          code: 'NOT_FOUND',
          status: 404
        }
      };
    } catch (error) {
      return {
        error: {
          message: 'Failed to reject invitation',
          code: 'INTERNAL_ERROR',
          status: 500
        }
      };
    }
  }
}