// src/services/api/restClient.ts
// REST client using fetch as alternative (if needed for DataSource REST)

import { ApiResponse } from '../../types';
import { config } from '../../config';

// Function to perform HTTP request with unified configuration
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    // Retrieve token from localStorage using key from unified config
    const token = localStorage.getItem(config.getAuthConfig().tokenKey);
    const response = await fetch(`${config.getApiConfig().baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
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

    const data = await response.json();
    return { data, status: response.status };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'API_ERROR',
        status: 500,
      },
    };
  }
}

export default { request };
