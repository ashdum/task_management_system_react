// src/services/data/graphqlDataSource.ts
import { ApiResponse, AuthResponse, Dashboard, DashboardInvitation, Card, Column } from './interface/dataTypes';
import { executeGraphQLQuery } from '../api/graphqlClient';
import { DataSource } from './interface/dataSourceTypes';

export class GraphQLDataSource implements DataSource {
  private query<T, R = T>(query: string, variables?: Record<string, any>): Promise<ApiResponse<R>> {
    return executeGraphQLQuery<R>(query, variables);
  }

  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const mutation = `
      mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          id
          email
          fullName
          createdAt
          updatedAt
          token
          refreshToken
        }
      }
    `;
    const response = await this.query<{ login: AuthResponse }>(mutation, { email, password });
    return {
      data: response.data?.login,
      error: response.error,
      status: response.status || 200,
    };
  }

  async register(email: string, password: string, fullName: string): Promise<ApiResponse<AuthResponse>> {
    const mutation = `
      mutation Register($email: String!, $password: String!, $fullName: String!) {
        register(email: $email, password: $password, fullName: $fullName) {
          id
          email
          fullName
          createdAt
          updatedAt
          token
          refreshToken
        }
      }
    `;
    const response = await this.query<{ register: AuthResponse }>(mutation, { email, password, fullName });
    return {
      data: response.data?.register,
      error: response.error,
      status: response.status || 201,
    };
  }

  async logout(): Promise<ApiResponse<any>> {
    const mutation = `mutation { logout }`;
    const response = await this.query(mutation);
    return response;
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<ApiResponse<AuthResponse>> {
    const mutation = `
      mutation ChangePassword($userId: ID!, $oldPassword: String!, $newPassword: String!) {
        changePassword(userId: $userId, oldPassword: $oldPassword, newPassword: $newPassword) {
          id
          email
          fullName
          createdAt
          updatedAt
          token
          refreshToken
        }
      }
    `;
    const response = await this.query<{ changePassword: AuthResponse }>(mutation, {
      userId,
      oldPassword,
      newPassword,
    });
    return {
      data: response.data?.changePassword,
      error: response.error,
      status: response.status || 200,
    };
  }

  // Метод для Google OAuth
  async googleLogin(credential: string): Promise<ApiResponse<AuthResponse>> {
    const mutation = `
      mutation GoogleLogin($credential: String!) {
        googleLogin(credential: $credential) {
          id
          email
          fullName
          createdAt
          updatedAt
          token
          refreshToken
        }
      }
    `;
    const response = await this.query<{ googleLogin: AuthResponse }>(mutation, { credential });
    return {
      data: response.data?.googleLogin,
      error: response.error,
      status: response.status || 200,
    };
  }

  // Метод для GitHub OAuth
  async githubCallback(code: string): Promise<ApiResponse<AuthResponse>> {
    const mutation = `
      mutation GithubCallback($code: String!) {
        githubCallback(code: $code) {
          id
          email
          fullName
          createdAt
          updatedAt
          token
          refreshToken
        }
      }
    `;
    const response = await this.query<{ githubCallback: AuthResponse }>(mutation, { code });
    return {
      data: response.data?.githubCallback,
      error: response.error,
      status: response.status || 200,
    };
  }

  // Остальные методы (dashboards, columns, cards, invitations) остаются без изменений
  async getDashboards(): Promise<ApiResponse<Dashboard[]>> {
    const query = `
      query GetDashboards {
        dashboards {
          id
          title
          createdAt
          ownerIds
          members {
            id
            email
            fullName
          }
          columns {
            id
            title
            order
            cards {
              id
              title
              description
              members {
                id
                email
              }
            }
          }
        }
      }
    `;
    const response = await this.query<{ dashboards: Dashboard[] }>(query);
    return { data: response.data?.dashboards, error: response.error, status: response.status || 200 };
  }

  async getDashboard(id: string): Promise<ApiResponse<Dashboard>> {
    const query = `
      query GetDashboard($id: ID!) {
        dashboard(id: $id) {
          id
          title
          createdAt
          ownerIds
          members {
            id
            email
            fullName
          }
          columns {
            id
            title
            order
            cards {
              id
              title
              description
              members {
                id
                email
              }
            }
          }
        }
      }
    `;
    const response = await this.query<{ dashboard: Dashboard }>(query, { id });
    return { data: response.data?.dashboard, error: response.error, status: response.status || 200 };
  }

  async createDashboard(title: string, userId: string): Promise<ApiResponse<Dashboard>> {
    const mutation = `
      mutation CreateDashboard($title: String!, $userId: ID!) {
        createDashboard(title: $title, userId: $userId) {
          id
          title
          createdAt
          ownerIds
          members {
            id
            email
            fullName
          }
          columns {
            id
            title
            order
            cards {
              id
              title
              description
              members {
                id
                email
              }
            }
          }
        }
      }
    `;
    const response = await this.query<{ createDashboard: Dashboard }>(mutation, { title, userId });
    return { data: response.data?.createDashboard, error: response.error, status: response.status || 201 };
  }

  async updateDashboard(id: string, data: Partial<Dashboard>): Promise<ApiResponse<Dashboard>> {
    const mutation = `
      mutation UpdateDashboard($id: ID!, $data: DashboardInput!) {
        updateDashboard(id: $id, data: $data) {
          id
          title
          createdAt
          ownerIds
          members {
            id
            email
            fullName
          }
          columns {
            id
            title
            order
            cards {
              id
              title
              description
            }
          }
        }
      }
    `;
    const response = await this.query<{ updateDashboard: Dashboard }>(mutation, { id, data });
    return { data: response.data?.updateDashboard, error: response.error, status: response.status || 200 };
  }

  async deleteDashboard(id: string): Promise<ApiResponse<void>> {
    const mutation = `
      mutation DeleteDashboard($id: ID!) {
        deleteDashboard(id: $id)
      }
    `;
    const response = await this.query(mutation, { id });
    return { data: undefined, error: response.error, status: response.status || 200 };
  }

  async createColumn(dashboardId: string, title: string): Promise<ApiResponse<Column>> {
    const mutation = `
      mutation CreateColumn($dashboardId: ID!, $title: String!) {
        createColumn(dashboardId: $dashboardId, title: $title) {
          id
          title
          order
          cards {
            id
            title
          }
        }
      }
    `;
    const response = await this.query<{ createColumn: Column }>(mutation, { dashboardId, title });
    return { data: response.data?.createColumn, error: response.error, status: response.status || 201 };
  }

  async updateColumn(dashboardId: string, columnId: string, data: Partial<Column>): Promise<ApiResponse<Column>> {
    const mutation = `
      mutation UpdateColumn($dashboardId: ID!, $columnId: ID!, $data: ColumnInput!) {
        updateColumn(dashboardId: $dashboardId, columnId: $columnId, data: $data) {
          id
          title
          order
          cards {
            id
            title
          }
        }
      }
    `;
    const response = await this.query<{ updateColumn: Column }>(mutation, { dashboardId, columnId, data });
    return { data: response.data?.updateColumn, error: response.error, status: response.status || 200 };
  }

  async deleteColumn(dashboardId: string, columnId: string): Promise<ApiResponse<void>> {
    const mutation = `
      mutation DeleteColumn($dashboardId: ID!, $columnId: ID!) {
        deleteColumn(dashboardId: $dashboardId, columnId: $columnId)
      }
    `;
    const response = await this.query(mutation, { dashboardId, columnId });
    return { data: undefined, error: response.error, status: response.status || 200 };
  }

  async updateColumnOrder(dashboardId: string, columnIds: string[]): Promise<ApiResponse<void>> {
    const mutation = `
      mutation UpdateColumnOrder($dashboardId: ID!, $columnIds: [ID!]!) {
        updateColumnOrder(dashboardId: $dashboardId, columnIds: $columnIds)
      }
    `;
    const response = await this.query(mutation, { dashboardId, columnIds });
    return { data: undefined, error: response.error, status: response.status || 200 };
  }

  async createCard(dashboardId: string, columnId: string, title: string): Promise<ApiResponse<Card>> {
    const mutation = `
      mutation CreateCard($dashboardId: ID!, $columnId: ID!, $title: String!) {
        createCard(dashboardId: $dashboardId, columnId: $columnId, title: $title) {
          id
          title
          description
        }
      }
    `;
    const response = await this.query<{ createCard: Card }>(mutation, { dashboardId, columnId, title });
    return { data: response.data?.createCard, error: response.error, status: response.status || 201 };
  }

  async updateCard(dashboardId: string, columnId: string, cardId: string, data: Partial<Card>): Promise<ApiResponse<Card>> {
    const mutation = `
      mutation UpdateCard($dashboardId: ID!, $columnId: ID!, $cardId: ID!, $data: CardInput!) {
        updateCard(dashboardId: $dashboardId, columnId: $columnId, cardId: $cardId, data: $data) {
          id
          title
          description
        }
      }
    `;
    const response = await this.query<{ updateCard: Card }>(mutation, { dashboardId, columnId, cardId, data });
    return { data: response.data?.updateCard, error: response.error, status: response.status || 200 };
  }

  async deleteCard(dashboardId: string, columnId: string, cardId: string): Promise<ApiResponse<void>> {
    const mutation = `
      mutation DeleteCard($dashboardId: ID!, $columnId: ID!, $cardId: ID!) {
        deleteCard(dashboardId: $dashboardId, columnId: $columnId, cardId: $cardId)
      }
    `;
    const response = await this.query(mutation, { dashboardId, columnId, cardId });
    return { data: undefined, error: response.error, status: response.status || 200 };
  }

  async moveCard(dashboardId: string, fromColumnId: string, toColumnId: string, cardId: string, newIndex: number): Promise<ApiResponse<void>> {
    const mutation = `
      mutation MoveCard($dashboardId: ID!, $fromColumnId: ID!, $toColumnId: ID!, $cardId: ID!, $newIndex: Int!) {
        moveCard(dashboardId: $dashboardId, fromColumnId: $fromColumnId, toColumnId: $toColumnId, cardId: $cardId, newIndex: $newIndex)
      }
    `;
    const response = await this.query(mutation, { dashboardId, fromColumnId, toColumnId, cardId, newIndex });
    return { data: undefined, error: response.error, status: response.status || 200 };
  }

  async inviteToDashboard(dashboardId: string, email: string): Promise<ApiResponse<DashboardInvitation>> {
    const mutation = `
      mutation InviteToDashboard($dashboardId: ID!, $email: String!) {
        inviteToDashboard(dashboardId: $dashboardId, email: $email) {
          id
          dashboardId
          inviterId
          inviterEmail
          inviteeEmail
          status
          createdAt
        }
      }
    `;
    const response = await this.query<{ inviteToDashboard: DashboardInvitation }>(mutation, { dashboardId, email });
    return { data: response.data?.inviteToDashboard, error: response.error, status: response.status || 201 };
  }

  async acceptInvitation(invitationId: string): Promise<ApiResponse<void>> {
    const mutation = `
      mutation AcceptInvitation($invitationId: ID!) {
        acceptInvitation(invitationId: $invitationId)
      }
    `;
    const response = await this.query(mutation, { invitationId });
    return { data: undefined, error: response.error, status: response.status || 200 };
  }

  async rejectInvitation(invitationId: string): Promise<ApiResponse<void>> {
    const mutation = `
      mutation RejectInvitation($invitationId: ID!) {
        rejectInvitation(invitationId: $invitationId)
      }
    `;
    const response = await this.query(mutation, { invitationId });
    return { data: undefined, error: response.error, status: response.status || 200 };
  }
}