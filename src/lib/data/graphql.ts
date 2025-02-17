import { config } from '../../config';
import type { DataSource } from './types';
import {
  ApiResponse,
  AuthResponse,
  Dashboard,
  DashboardInvitation,
  User,
} from '../../types';

type GraphQLResponse<T> = {
  [K in keyof T]: T[K];
}

export class GraphQLDataSource implements DataSource {
  private baseUrl: string;
  private endpoint: string;

  constructor() {
    const { baseUrl, endpoints } = config.getConfig().api;
    this.baseUrl = baseUrl;
    this.endpoint = endpoints.graphql;
  }

  private async query<T, R = T>(
    query: string,
    variables?: Record<string, any>
  ): Promise<ApiResponse<R>> {
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
        return {
          error: {
            message: `HTTP error! status: ${response.status}`,
            code: 'API_ERROR',
            status: response.status
          }
        };
      }

      const result = await response.json();
      
      if (result.errors) {
        const graphQLError = result.errors[0];
        return {
          error: {
            message: graphQLError.message,
            code: graphQLError.extensions?.code || 'GRAPHQL_ERROR',
            status: graphQLError.extensions?.status || 400
          }
        };
      }

      return { 
        data: result.data as unknown as R,
        status: 200 
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
    const mutation = `
      mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          id
          email
          fullName
          createdAt
          updatedAt
          token
        }
      }
    `;
    
    return this.query<{ login: AuthResponse }>(mutation, { email, password })
      .then(response => ({
        data: response.data?.login,
        status: response.status
      }));
  }

  async register(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const mutation = `
      mutation Register($email: String!, $password: String!) {
        register(email: $email, password: $password) {
          id
          email
          fullName
          createdAt
          updatedAt
          token
        }
      }
    `;
    
    return this.query<{ register: AuthResponse }>(mutation, { email, password })
      .then(response => ({
        data: response.data?.register,
        status: response.status
      }));
  }

  async logout(): Promise<void> {
    const mutation = `
      mutation Logout {
        logout
      }
    `;
    
    await this.query(mutation);
  }

  // Dashboard invitation methods
  async inviteToDashboard(
    dashboardId: string,
    email: string
  ): Promise<ApiResponse<DashboardInvitation>> {
    const response = await this.query<{ inviteToDashboard: DashboardInvitation }, DashboardInvitation>(
      `mutation InviteToDashboard($dashboardId: ID!, $email: String!) {
        inviteToDashboard(dashboardId: $dashboardId, email: $email) {
          id
          dashboardId
          inviterId
          inviterEmail
          inviteeEmail
          status
          createdAt
        }
      }`,
      { dashboardId, email }
    );

    if (response.error) {
      return response;
    }

    return {
      data: (response.data as any).inviteToDashboard,
      status: 201
    };
  }

  async acceptInvitation(invitationId: string): Promise<ApiResponse<void>> {
    const response = await this.query<{ acceptInvitation: boolean }, void>(
      `mutation AcceptInvitation($invitationId: ID!) {
        acceptInvitation(invitationId: $invitationId)
      }`,
      { invitationId }
    );

    if (response.error) {
      return response;
    }

    return {
      data: undefined,
      status: 200
    };
  }

  async rejectInvitation(invitationId: string): Promise<ApiResponse<void>> {
    const response = await this.query<{ rejectInvitation: boolean }, void>(
      `mutation RejectInvitation($invitationId: ID!) {
        rejectInvitation(invitationId: $invitationId)
      }`,
      { invitationId }
    );

    if (response.error) {
      return response;
    }

    return {
      data: undefined,
      status: 200
    };
  }

  // Dashboard methods
  async getDashboards(): Promise<ApiResponse<Dashboard[]>> {
    const response = await this.query<{ dashboards: Dashboard[] }, Dashboard[]>(
      `query GetDashboards {
        dashboards {
          id
          title
          createdAt
          ownerIds
          members {
            id
            email
            fullName
            avatar
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
      }`
    );

    if (response.error) {
      return response;
    }

    return {
      data: (response.data as any).dashboards,
      status: 200
    };
  }
}