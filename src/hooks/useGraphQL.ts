import { useAuth } from './useAuth';
import { graphqlClient, GraphQLRequest, GraphQLResponse } from '../utils/graphql';
import { auth } from '../lib/firebase';
import { DEFAULT_TENANT } from '../lib/config';

export function useGraphQL() {
  const { isEmbedded, tenant, authToken: embeddedToken, onTokenExpired } = useAuth();

  const executeQuery = async <T = unknown>(
    request: GraphQLRequest
  ): Promise<GraphQLResponse<T>> => {
    let token: string | null = null;

    // If we're in embedded mode, use the token from context (provided by parent app)
    // Otherwise, get the token from Firebase auth
    if (isEmbedded) {
      token = embeddedToken;
      if (!token) {
        throw new Error('No authentication token provided in embedded mode');
      }
    } else {
      // Get the current Firebase token in standalone mode
      token = await auth.currentUser?.getIdToken() || null;
      if (!token) {
        throw new Error('No authentication token available');
      }
    }

    // Set the token in the GraphQL client
    graphqlClient.setAuthToken(token);

    // Set the tenant ID for multi-tenant Hasura queries
    const tenantId = tenant?.name || DEFAULT_TENANT;
    graphqlClient.setTenantId(tenantId);

    // Execute the request
    try {
      return await graphqlClient.request<T>(request);
    } catch (error) {
      // Check for authentication errors and notify parent if needed
      if (error instanceof Error && error.message.includes('401')) {
        onTokenExpired?.();
      }
      throw error;
    }
  };

  const query = async <T = unknown>(
    query: string,
    variables?: Record<string, unknown>,
    operationName?: string
  ): Promise<GraphQLResponse<T>> => {
    return executeQuery<T>({ query, variables, operationName });
  };

  const mutate = async <T = unknown>(
    mutation: string,
    variables?: Record<string, unknown>,
    operationName?: string
  ): Promise<GraphQLResponse<T>> => {
    return executeQuery<T>({ query: mutation, variables, operationName });
  };

  return {
    executeQuery,
    query,
    mutate,
  };
}