import { useState, useEffect, useCallback, useRef } from 'react';
import { useGraphQL } from './useGraphQL';
import {
  ClientType,
  ClientTypeGraphQLResponse,
  CreateClientTypeInput,
  UpdateClientTypeInput,
  SortOrderUpdate,
  transformGraphQLResponse,
} from '../types/clientType';

/**
 * GraphQL Queries and Mutations for Client Types
 */
const QUERIES = {
  // Get all client types ordered by sort_order
  // Note: clients_aggregate and is_default may not exist in all schemas
  // We query for them but handle missing fields gracefully
  GET_CLIENT_TYPES: `
    query GetClientTypes {
      jsg_reference_schema_client_types(order_by: {sort_order: asc}) {
        id
        name
        description
        agent
        is_active
        sort_order
        created_at
        updated_at
      }
    }
  `,

  CREATE_CLIENT_TYPE: `
    mutation CreateClientType($object: jsg_reference_schema_client_types_insert_input!) {
      insert_jsg_reference_schema_client_types_one(object: $object) {
        id
        name
        description
        agent
        is_active
        sort_order
        created_at
        updated_at
      }
    }
  `,

  UPDATE_CLIENT_TYPE: `
    mutation UpdateClientType($id: Int!, $set: jsg_reference_schema_client_types_set_input!) {
      update_jsg_reference_schema_client_types_by_pk(pk_columns: {id: $id}, _set: $set) {
        id
        name
        description
        agent
        is_active
        sort_order
        created_at
        updated_at
      }
    }
  `,

  DELETE_CLIENT_TYPE: `
    mutation DeleteClientType($id: Int!) {
      delete_jsg_reference_schema_client_types_by_pk(id: $id) {
        id
      }
    }
  `,

  // Bulk update sort orders after drag-and-drop
  UPDATE_SORT_ORDER: `
    mutation UpdateClientTypeSortOrder($updates: [jsg_reference_schema_client_types_updates!]!) {
      update_jsg_reference_schema_client_types_many(updates: $updates) {
        affected_rows
      }
    }
  `,
};

/**
 * Response types for GraphQL operations
 */
interface GetClientTypesResponse {
  jsg_reference_schema_client_types: ClientTypeGraphQLResponse[];
}

interface CreateClientTypeResponse {
  insert_jsg_reference_schema_client_types_one: ClientTypeGraphQLResponse;
}

interface UpdateClientTypeResponse {
  update_jsg_reference_schema_client_types_by_pk: ClientTypeGraphQLResponse;
}

interface DeleteClientTypeResponse {
  delete_jsg_reference_schema_client_types_by_pk: { id: string } | null;
}

interface UpdateSortOrderResponse {
  update_jsg_reference_schema_client_types_many: { affected_rows: number }[];
}

/**
 * Hook for managing client types data and operations
 *
 * Provides:
 * - clientTypes: Array of all client types
 * - isLoading: Loading state
 * - error: Error message if any
 * - CRUD operations for client types
 * - Sort order management for drag-and-drop
 * - Default type management
 */
export function useClientTypes() {
  const { query, mutate } = useGraphQL();

  // State
  const [clientTypes, setClientTypes] = useState<ClientType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track if we've already fetched to prevent infinite loops
  const hasFetchedRef = useRef(false);

  /**
   * Transform raw GraphQL response to ClientType
   * Handles missing is_default and clients_aggregate fields
   */
  const transformResponse = useCallback((
    response: ClientTypeGraphQLResponse,
    index: number,
    allResponses: ClientTypeGraphQLResponse[]
  ): ClientType => {
    // Use the transformGraphQLResponse helper for basic transformation
    const baseType = transformGraphQLResponse(response);

    // Handle is_default - if not in response, determine from position or set first as default
    // For now, we manage is_default in local state since it may not be in the DB
    const hasExistingDefault = allResponses.some((r) => (r as { is_default?: boolean }).is_default === true);

    return {
      ...baseType,
      // If is_default not in schema, default first item to be the default
      is_default: (response as { is_default?: boolean }).is_default ?? (!hasExistingDefault && index === 0),
      // client_count is already handled in transformGraphQLResponse, defaults to 0
    };
  }, []);

  /**
   * Fetch all client types from the API
   */
  const fetchClientTypes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await query<GetClientTypesResponse>(
        QUERIES.GET_CLIENT_TYPES,
        undefined,
        'GetClientTypes'
      );

      if (response.errors && response.errors.length > 0) {
        throw new Error(response.errors[0].message);
      }

      if (response.data?.jsg_reference_schema_client_types) {
        const rawTypes = response.data.jsg_reference_schema_client_types;
        const transformed = rawTypes.map((type, index) =>
          transformResponse(type, index, rawTypes)
        );
        setClientTypes(transformed);
      } else {
        setClientTypes([]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch client types';
      setError(message);
      console.error('Error fetching client types:', err);
    } finally {
      setIsLoading(false);
    }
  }, [query, transformResponse]);

  /**
   * Create a new client type
   */
  const createClientType = useCallback(async (
    input: CreateClientTypeInput
  ): Promise<ClientType | null> => {
    setError(null);

    try {
      // Calculate the next sort_order
      const maxSortOrder = clientTypes.reduce(
        (max, type) => Math.max(max, type.sort_order),
        -1
      );

      const object = {
        name: input.name.trim(),
        description: input.description?.trim() || null,
        agent: input.agent ?? false,
        is_active: input.is_active ?? true,
        sort_order: maxSortOrder + 1,
      };

      const response = await mutate<CreateClientTypeResponse>(
        QUERIES.CREATE_CLIENT_TYPE,
        { object },
        'CreateClientType'
      );

      if (response.errors && response.errors.length > 0) {
        throw new Error(response.errors[0].message);
      }

      if (response.data?.insert_jsg_reference_schema_client_types_one) {
        const newType = transformResponse(
          response.data.insert_jsg_reference_schema_client_types_one,
          clientTypes.length,
          []
        );

        // Set is_default to false for new types (unless it's the first one)
        const finalNewType: ClientType = {
          ...newType,
          is_default: clientTypes.length === 0,
        };

        // Add to state
        setClientTypes(prev => [...prev, finalNewType]);

        return finalNewType;
      }

      return null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create client type';
      setError(message);
      console.error('Error creating client type:', err);
      throw err;
    }
  }, [clientTypes, mutate, transformResponse]);

  /**
   * Update an existing client type
   */
  const updateClientType = useCallback(async (
    id: string,
    updates: Omit<UpdateClientTypeInput, 'id'>
  ): Promise<ClientType | null> => {
    setError(null);

    try {
      // Build the set object, only including defined values
      const set: Record<string, unknown> = {};
      if (updates.name !== undefined) set.name = updates.name.trim();
      if (updates.description !== undefined) set.description = updates.description?.trim() || null;
      if (updates.agent !== undefined) set.agent = updates.agent;
      if (updates.is_active !== undefined) set.is_active = updates.is_active;
      if (updates.sort_order !== undefined) set.sort_order = updates.sort_order;

      const response = await mutate<UpdateClientTypeResponse>(
        QUERIES.UPDATE_CLIENT_TYPE,
        { id: parseInt(id, 10), set },
        'UpdateClientType'
      );

      if (response.errors && response.errors.length > 0) {
        throw new Error(response.errors[0].message);
      }

      if (response.data?.update_jsg_reference_schema_client_types_by_pk) {
        const updatedType = transformResponse(
          response.data.update_jsg_reference_schema_client_types_by_pk,
          0,
          []
        );

        // Preserve local is_default state
        const existingType = clientTypes.find(t => t.id === id);
        const finalUpdatedType: ClientType = {
          ...updatedType,
          is_default: updates.is_default ?? existingType?.is_default ?? false,
        };

        // Update in state
        setClientTypes(prev =>
          prev.map(type => type.id === id ? finalUpdatedType : type)
        );

        return finalUpdatedType;
      }

      return null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update client type';
      setError(message);
      console.error('Error updating client type:', err);
      throw err;
    }
  }, [clientTypes, mutate, transformResponse]);

  /**
   * Delete a client type
   */
  const deleteClientType = useCallback(async (id: string): Promise<boolean> => {
    setError(null);

    try {
      const response = await mutate<DeleteClientTypeResponse>(
        QUERIES.DELETE_CLIENT_TYPE,
        { id: parseInt(id, 10) },
        'DeleteClientType'
      );

      if (response.errors && response.errors.length > 0) {
        throw new Error(response.errors[0].message);
      }

      if (response.data?.delete_jsg_reference_schema_client_types_by_pk) {
        // Remove from state
        setClientTypes(prev => prev.filter(type => type.id !== id));
        return true;
      }

      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete client type';
      setError(message);
      console.error('Error deleting client type:', err);
      throw err;
    }
  }, [mutate]);

  /**
   * Bulk update sort orders after drag-and-drop reordering
   */
  const updateSortOrder = useCallback(async (
    updates: SortOrderUpdate[]
  ): Promise<boolean> => {
    setError(null);

    if (updates.length === 0) return true;

    // Optimistically update local state first
    const previousState = [...clientTypes];
    setClientTypes(prev => {
      const updated = [...prev];
      updates.forEach(update => {
        const index = updated.findIndex(t => t.id === update.id);
        if (index !== -1) {
          updated[index] = { ...updated[index], sort_order: update.sort_order };
        }
      });
      return updated.sort((a, b) => a.sort_order - b.sort_order);
    });

    try {
      // Format updates for the bulk mutation
      // Convert string ids to integers for the database
      const formattedUpdates = updates.map(update => ({
        where: { id: { _eq: parseInt(update.id, 10) } },
        _set: { sort_order: update.sort_order },
      }));

      const response = await mutate<UpdateSortOrderResponse>(
        QUERIES.UPDATE_SORT_ORDER,
        { updates: formattedUpdates },
        'UpdateClientTypeSortOrder'
      );

      if (response.errors && response.errors.length > 0) {
        throw new Error(response.errors[0].message);
      }

      return true;
    } catch (err) {
      // Revert to previous state on error
      setClientTypes(previousState);

      const message = err instanceof Error ? err.message : 'Failed to update sort order';
      setError(message);
      console.error('Error updating sort order:', err);
      throw err;
    }
  }, [clientTypes, mutate]);

  /**
   * Toggle the active status of a client type
   * Convenience method for quick status updates
   */
  const toggleActiveStatus = useCallback(async (
    id: string,
    isActive: boolean
  ): Promise<ClientType | null> => {
    return updateClientType(id, { is_active: isActive });
  }, [updateClientType]);

  /**
   * Refresh the client types list
   */
  const refresh = useCallback(() => {
    hasFetchedRef.current = false;
    fetchClientTypes();
  }, [fetchClientTypes]);

  /**
   * Clear any error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch data once on mount
  useEffect(() => {
    // Prevent multiple fetches / infinite loops
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    fetchClientTypes();
  }, [fetchClientTypes]);

  return {
    // State
    clientTypes,
    isLoading,
    error,

    // CRUD operations
    fetchClientTypes: refresh,
    createClientType,
    updateClientType,
    deleteClientType,

    // Special operations
    updateSortOrder,
    toggleActiveStatus,

    // Utility
    clearError,
  };
}
