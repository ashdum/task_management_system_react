// src/services/api/graphqlClient.ts
// GraphQL client using fetch with token from apiClient

import { ApiResponse } from '../data/interface/dataTypes';
import { config } from '../../config';
import apiClientInstance from './apiClient';

// Retrieve GraphQL endpoint from unified config
const GRAPHQL_ENDPOINT = config.getApiConfig().endpoints.graphql;

export async function executeGraphQLQuery<T>(query: string, variables?: any): Promise<ApiResponse<T>> {
  try {
    const token = apiClientInstance.getAuthToken();
    // Build the full URL using baseUrl and GraphQL endpoint from config
    const url = `${config.getApiConfig().baseUrl}${GRAPHQL_ENDPOINT}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      return {
        error: {
          message: `HTTP error! status: ${response.status}`,
          code: 'API_ERROR',
          status: response.status,
        },
      };
    }

    const result = await response.json();

    if (result.errors) {
      return {
        error: {
          message: result.errors[0]?.message || 'GraphQL Error',
          code: result.errors[0]?.extensions?.code || 'GRAPHQL_ERROR',
          status: result.errors[0]?.extensions?.status || 400,
        },
      };
    }

    return { data: result.data, status: 200 };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'GRAPHQL_ERROR',
        status: 500,
      },
    };
  }
}

export async function graphqlLogin(email: string, password: string) {
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
  const response = await executeGraphQLQuery<{ login: any }>(mutation, { email, password });
  if (response.data) {
    // Set token from GraphQL login response
    ApiClient.setAuthToken(response.data.login.token);
  }
  return response;
}

export async function graphqlLogout() {
  const mutation = `mutation { logout }`;
  await executeGraphQLQuery(mutation);
  ApiClient.clearAuthToken();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('unauthorized'));
  }
}
