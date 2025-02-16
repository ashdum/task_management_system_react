import { config } from '../../config';
import type { DataSource } from './types';
import type {
  User,
  Dashboard,
  Card,
  Column,
  ApiResponse,
} from '../../types';

export class GraphQLDataSource implements DataSource {
  private baseUrl: string;
  private endpoint: string;

  constructor() {
    const { baseUrl, endpoints } = config.getConfig().api;
    this.baseUrl = baseUrl;
    this.endpoint = endpoints.graphql;
  }

  private async query<T>(
    query: string,
    variables?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem(config.getConfig().auth.tokenKey)}`,
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      return { data: result.data };
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
    const response = await this.query<{ login: User }>(
      `mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          id
          email
        }
      }`,
      { email, password }
    );

    return response.data ? { data: response.data.login } : response;
  }

  async register(email: string, password: string): Promise<ApiResponse<User>> {
    const response = await this.query<{ register: User }>(
      `mutation Register($email: String!, $password: String!) {
        register(email: $email, password: $password) {
          id
          email
        }
      }`,
      { email, password }
    );

    return response.data ? { data: response.data.register } : response;
  }

  async logout(): Promise<void> {
    localStorage.removeItem(config.getConfig().auth.tokenKey);
  }

  // Dashboard methods
  async getDashboards(): Promise<ApiResponse<Dashboard[]>> {
    const response = await this.query<{ dashboards: Dashboard[] }>(
      `query GetDashboards {
        dashboards {
          id
          title
          createdAt
          ownerIds
          members {
            id
            email
          }
          columns {
            id
            title
            order
            cards {
              id
              number
              title
              description
            }
          }
        }
      }`
    );

    return response.data ? { data: response.data.dashboards } : response;
  }

  async getDashboard(id: string): Promise<ApiResponse<Dashboard>> {
    const response = await this.query<{ dashboard: Dashboard }>(
      `query GetDashboard($id: ID!) {
        dashboard(id: $id) {
          id
          title
          createdAt
          ownerIds
          members {
            id
            email
          }
          columns {
            id
            title
            order
            cards {
              id
              number
              title
              description
            }
          }
        }
      }`,
      { id }
    );

    return response.data ? { data: response.data.dashboard } : response;
  }

  async createDashboard(title: string, userId: string): Promise<ApiResponse<Dashboard>> {
    const response = await this.query<{ createDashboard: Dashboard }>(
      `mutation CreateDashboard($input: CreateDashboardInput!) {
        createDashboard(input: $input) {
          id
          title
          createdAt
          ownerIds
          members {
            id
            email
          }
          columns {
            id
            title
            order
          }
        }
      }`,
      { input: { title, userId } }
    );

    return response.data ? { data: response.data.createDashboard } : response;
  }

  async updateDashboard(id: string, data: Partial<Dashboard>): Promise<ApiResponse<Dashboard>> {
    const response = await this.query<{ updateDashboard: Dashboard }>(
      `mutation UpdateDashboard($id: ID!, $input: UpdateDashboardInput!) {
        updateDashboard(id: $id, input: $input) {
          id
          title
          createdAt
          ownerIds
          members {
            id
            email
          }
          columns {
            id
            title
            order
          }
        }
      }`,
      { id, input: data }
    );

    return response.data ? { data: response.data.updateDashboard } : response;
  }

  async deleteDashboard(id: string): Promise<ApiResponse<void>> {
    return this.query<void>(
      `mutation DeleteDashboard($id: ID!) {
        deleteDashboard(id: $id)
      }`,
      { id }
    );
  }

  // Column methods
  async createColumn(dashboardId: string, title: string): Promise<ApiResponse<Column>> {
    const response = await this.query<{ createColumn: Column }>(
      `mutation CreateColumn($input: CreateColumnInput!) {
        createColumn(input: $input) {
          id
          title
          order
          cards {
            id
            number
            title
          }
        }
      }`,
      { input: { dashboardId, title } }
    );

    return response.data ? { data: response.data.createColumn } : response;
  }

  async updateColumn(
    dashboardId: string,
    columnId: string,
    data: Partial<Column>
  ): Promise<ApiResponse<Column>> {
    const response = await this.query<{ updateColumn: Column }>(
      `mutation UpdateColumn($dashboardId: ID!, $columnId: ID!, $input: UpdateColumnInput!) {
        updateColumn(dashboardId: $dashboardId, columnId: $columnId, input: $input) {
          id
          title
          order
          cards {
            id
            number
            title
          }
        }
      }`,
      { dashboardId, columnId, input: data }
    );

    return response.data ? { data: response.data.updateColumn } : response;
  }

  async deleteColumn(dashboardId: string, columnId: string): Promise<ApiResponse<void>> {
    return this.query<void>(
      `mutation DeleteColumn($dashboardId: ID!, $columnId: ID!) {
        deleteColumn(dashboardId: $dashboardId, columnId: $columnId)
      }`,
      { dashboardId, columnId }
    );
  }

  async updateColumnOrder(
    dashboardId: string,
    columnIds: string[]
  ): Promise<ApiResponse<void>> {
    return this.query<void>(
      `mutation UpdateColumnOrder($dashboardId: ID!, $columnIds: [ID!]!) {
        updateColumnOrder(dashboardId: $dashboardId, columnIds: $columnIds)
      }`,
      { dashboardId, columnIds }
    );
  }

  // Card methods
  async createCard(
    dashboardId: string,
    columnId: string,
    title: string
  ): Promise<ApiResponse<Card>> {
    const response = await this.query<{ createCard: Card }>(
      `mutation CreateCard($input: CreateCardInput!) {
        createCard(input: $input) {
          id
          number
          title
          description
          columnId
          members {
            id
            email
          }
          labels {
            id
            text
            color
          }
        }
      }`,
      { input: { dashboardId, columnId, title } }
    );

    return response.data ? { data: response.data.createCard } : response;
  }

  async updateCard(
    dashboardId: string,
    columnId: string,
    cardId: string,
    data: Partial<Card>
  ): Promise<ApiResponse<Card>> {
    const response = await this.query<{ updateCard: Card }>(
      `mutation UpdateCard($dashboardId: ID!, $columnId: ID!, $cardId: ID!, $input: UpdateCardInput!) {
        updateCard(dashboardId: $dashboardId, columnId: $columnId, cardId: $cardId, input: $input) {
          id
          number
          title
          description
          columnId
          members {
            id
            email
          }
          labels {
            id
            text
            color
          }
        }
      }`,
      { dashboardId, columnId, cardId, input: data }
    );

    return response.data ? { data: response.data.updateCard } : response;
  }

  async deleteCard(
    dashboardId: string,
    columnId: string,
    cardId: string
  ): Promise<ApiResponse<void>> {
    return this.query<void>(
      `mutation DeleteCard($dashboardId: ID!, $columnId: ID!, $cardId: ID!) {
        deleteCard(dashboardId: $dashboardId, columnId: $columnId, cardId: $cardId)
      }`,
      { dashboardId, columnId, cardId }
    );
  }

  async moveCard(
    dashboardId: string,
    fromColumnId: string,
    toColumnId: string,
    cardId: string,
    newIndex: number
  ): Promise<ApiResponse<void>> {
    return this.query<void>(
      `mutation MoveCard($input: MoveCardInput!) {
        moveCard(input: $input)
      }`,
      {
        input: {
          dashboardId,
          fromColumnId,
          toColumnId,
          cardId,
          newIndex,
        },
      }
    );
  }
}