import { gql } from 'graphql-tag';
import { ApiClient } from './axios';
import { storage } from './storage';
import { 
  User, Dashboard, Card, Column, 
  ApiResponse, PaginatedResponse 
} from '../../types';

const api = ApiClient.getInstance();
const GRAPHQL_ENDPOINT = `${import.meta.env.VITE_API_URL}/graphql`;

// GraphQL Queries
const QUERIES = {
  GET_DASHBOARDS: gql`
    query GetDashboards {
      dashboards {
        id
        title
        createdAt
        ownerIds
        background
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
            members {
              id
              email
            }
            labels {
              id
              text
              color
            }
            checklists {
              id
              title
              items {
                id
                text
                completed
              }
            }
            comments {
              id
              text
              userId
              userEmail
              createdAt
            }
          }
        }
      }
    }
  `,

  GET_DASHBOARD: gql`
    query GetDashboard($id: ID!) {
      dashboard(id: $id) {
        id
        title
        createdAt
        ownerIds
        background
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
            members {
              id
              email
            }
            labels {
              id
              text
              color
            }
            checklists {
              id
              title
              items {
                id
                text
                completed
              }
            }
            comments {
              id
              text
              userId
              userEmail
              createdAt
            }
          }
        }
      }
    }
  `,
};

// GraphQL Mutations
const MUTATIONS = {
  LOGIN: gql`
    mutation Login($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        user {
          id
          email
        }
        token
      }
    }
  `,

  REGISTER: gql`
    mutation Register($email: String!, $password: String!) {
      register(email: $email, password: $password) {
        user {
          id
          email
        }
        token
      }
    }
  `,

  CREATE_DASHBOARD: gql`
    mutation CreateDashboard($input: CreateDashboardInput!) {
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
    }
  `,

  UPDATE_DASHBOARD: gql`
    mutation UpdateDashboard($id: ID!, $input: UpdateDashboardInput!) {
      updateDashboard(id: $id, input: $input) {
        id
        title
        background
      }
    }
  `,

  CREATE_COLUMN: gql`
    mutation CreateColumn($input: CreateColumnInput!) {
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
    }
  `,

  UPDATE_COLUMN_ORDER: gql`
    mutation UpdateColumnOrder($dashboardId: ID!, $columnIds: [ID!]!) {
      updateColumnOrder(dashboardId: $dashboardId, columnIds: $columnIds)
    }
  `,

  CREATE_CARD: gql`
    mutation CreateCard($input: CreateCardInput!) {
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
    }
  `,

  UPDATE_CARD: gql`
    mutation UpdateCard($id: ID!, $input: UpdateCardInput!) {
      updateCard(id: $id, input: $input) {
        id
        title
        description
        members {
          id
          email
        }
        labels {
          id
          text
          color
        }
        checklists {
          id
          title
          items {
            id
            text
            completed
          }
        }
        comments {
          id
          text
          userId
          userEmail
          createdAt
        }
      }
    }
  `,

  MOVE_CARD: gql`
    mutation MoveCard($input: MoveCardInput!) {
      moveCard(input: $input) {
        id
        columnId
      }
    }
  `,
};

export class GraphQLAPI {
  static async executeQuery<T>(
    query: string, 
    variables?: any
  ): Promise<ApiResponse<T>> {
    try {
      const response = await api.post<{ data: T; errors?: any[] }>(
        GRAPHQL_ENDPOINT,
        {
          query,
          variables,
        }
      );

      if (response.error) {
        // Log error safely
        console.error('GraphQL Error:', JSON.stringify(response.error, null, 2));
        throw response.error;
      }

      if (response.data?.errors) {
        const error = {
          message: response.data.errors[0]?.message || 'GraphQL Error',
          code: 'GRAPHQL_ERROR',
        };
        console.error('GraphQL Errors:', JSON.stringify(error, null, 2));
        throw error;
      }

      return { data: response.data.data };
    } catch (error) {
      // Create a safe error object
      const safeError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'GRAPHQL_ERROR',
      };
      
      console.error('GraphQL Execution Error:', JSON.stringify(safeError, null, 2));
      
      // If API call fails, fall back to local storage
      console.log('Falling back to local storage');
      return {
        error: safeError,
      };
    }
  }

  static async login(email: string, password: string): Promise<User> {
    const response = await this.executeQuery<{ login: { user: User; token: string } }>(
      MUTATIONS.LOGIN,
      { email, password }
    );

    if (response.error) {
      console.warn('GraphQL login failed, using local storage:', response.error);
      return {
        id: 'user-1',
        email,
      };
    }

    const { user, token } = response.data!.login;
    api.setAuthToken(token);
    return user;
  }

  static async register(email: string, password: string): Promise<User> {
    const response = await this.executeQuery<{ register: { user: User; token: string } }>(
      MUTATIONS.REGISTER,
      { email, password }
    );

    if (response.error) {
      console.warn('GraphQL register failed, using local storage:', response.error);
      return {
        id: `user-${Date.now()}`,
        email,
      };
    }

    const { user, token } = response.data!.register;
    api.setAuthToken(token);
    return user;
  }

  static async getDashboards(): Promise<Dashboard[]> {
    const response = await this.executeQuery<{ dashboards: Dashboard[] }>(
      QUERIES.GET_DASHBOARDS
    );

    if (response.error) {
      console.warn('GraphQL getDashboards failed, using local storage:', response.error);
      const data = storage.getData();
      
      if (data.dashboards.length === 0) {
        const initialDashboard = this.generateInitialDashboard('user-1');
        data.dashboards.push(initialDashboard);
        storage.setData(data);
      }
      
      return data.dashboards;
    }

    return response.data!.dashboards;
  }

  static async createDashboard(title: string, userId: string): Promise<Dashboard> {
    const response = await this.executeQuery<{ createDashboard: Dashboard }>(
      MUTATIONS.CREATE_DASHBOARD,
      {
        input: {
          title,
          ownerIds: [userId],
        },
      }
    );

    if (response.error) {
      console.warn('GraphQL createDashboard failed, using local storage:', response.error);
      const dashboard = this.generateInitialDashboard(userId, title);
      const data = storage.getData();
      data.dashboards.push(dashboard);
      storage.setData(data);
      return dashboard;
    }

    return response.data!.createDashboard;
  }

  // Helper method to generate initial dashboard
  private static generateInitialDashboard(userId: string, title = 'My First Board'): Dashboard {
    return {
      id: `dashboard-${Date.now()}`,
      title,
      ownerIds: [userId],
      members: [{ id: userId, email: 'user@example.com' }],
      createdAt: new Date().toISOString(),
      columns: [
        {
          id: 'column-1',
          title: 'To Do',
          order: 0,
          cards: [],
        },
        {
          id: 'column-2',
          title: 'In Progress',
          order: 1,
          cards: [],
        },
        {
          id: 'column-3',
          title: 'Done',
          order: 2,
          cards: [],
        },
      ],
    };
  }

  // Add other GraphQL methods following the same pattern...
}