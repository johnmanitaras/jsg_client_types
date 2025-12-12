/**
 * Client Type TypeScript Interfaces
 *
 * These types define the data model for client type classifications
 * used throughout the JetSetGo platform to categorize customers,
 * apply pricing rules, and control access to agent-specific features.
 */

/**
 * Core ClientType interface representing a client classification
 * Maps to the jsg_reference_schema_client_types table in Hasura
 */
export interface ClientType {
  /** Unique identifier (UUID) - read-only, auto-generated */
  id: string;

  /** Display name shown throughout the system (1-100 characters) */
  name: string;

  /** Optional description for additional context (0-500 characters) */
  description: string | null;

  /** Whether this type represents a travel agent or reseller */
  agent: boolean;

  /** Whether the type is active and available in booking forms */
  is_active: boolean;

  /** Whether this is the default type for new clients/walk-ups */
  is_default: boolean;

  /** Display order in dropdowns and lists (auto-managed) */
  sort_order: number;

  /** Number of clients using this type (derived from aggregate) - read-only */
  client_count: number;

  /** Timestamp when the record was created - read-only */
  created_at: string;

  /** Timestamp when the record was last updated - read-only */
  updated_at: string;
}

/**
 * Input type for creating a new client type
 * Excludes read-only fields that are auto-generated
 */
export interface CreateClientTypeInput {
  name: string;
  description?: string | null;
  agent?: boolean;
  is_active?: boolean;
}

/**
 * Input type for updating an existing client type
 * All fields are optional except the id for identification
 */
export interface UpdateClientTypeInput {
  id: string;
  name?: string;
  description?: string | null;
  agent?: boolean;
  is_active?: boolean;
  is_default?: boolean;
  sort_order?: number;
}

/**
 * GraphQL response shape for client type queries
 * Includes the aggregate for client count
 */
export interface ClientTypeGraphQLResponse {
  id: string;
  name: string;
  description: string | null;
  agent: boolean;
  is_active: boolean;
  is_default: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  clients_aggregate?: {
    aggregate: {
      count: number;
    };
  };
}

/**
 * Form state for create/edit modal
 */
export interface ClientTypeFormData {
  name: string;
  description: string;
  agent: boolean;
  is_active: boolean;
}

/**
 * Form validation errors
 */
export interface ClientTypeFormErrors {
  name?: string;
  description?: string;
}

/**
 * Sort order update for drag-and-drop reordering
 */
export interface SortOrderUpdate {
  id: string;
  sort_order: number;
}

/**
 * Filter options for the client types list
 */
export type StatusFilter = 'all' | 'active' | 'inactive';

/**
 * Helper function to transform GraphQL response to ClientType
 */
export function transformGraphQLResponse(response: ClientTypeGraphQLResponse): ClientType {
  return {
    id: response.id,
    name: response.name,
    description: response.description,
    agent: response.agent,
    is_active: response.is_active,
    is_default: response.is_default,
    sort_order: response.sort_order,
    client_count: response.clients_aggregate?.aggregate?.count ?? 0,
    created_at: response.created_at,
    updated_at: response.updated_at,
  };
}

/**
 * Helper function to initialize form data for creating a new client type
 */
export function getInitialFormData(): ClientTypeFormData {
  return {
    name: '',
    description: '',
    agent: false,
    is_active: true,
  };
}

/**
 * Helper function to convert ClientType to form data for editing
 */
export function clientTypeToFormData(clientType: ClientType): ClientTypeFormData {
  return {
    name: clientType.name,
    description: clientType.description ?? '',
    agent: clientType.agent,
    is_active: clientType.is_active,
  };
}

/**
 * Validation function for client type form
 */
export function validateClientTypeForm(data: ClientTypeFormData): ClientTypeFormErrors {
  const errors: ClientTypeFormErrors = {};

  // Name validation
  if (!data.name.trim()) {
    errors.name = 'Name is required';
  } else if (data.name.length > 100) {
    errors.name = 'Name must be 100 characters or less';
  }

  // Description validation
  if (data.description && data.description.length > 500) {
    errors.description = 'Description must be 500 characters or less';
  }

  return errors;
}

/**
 * Check if form has any validation errors
 */
export function hasFormErrors(errors: ClientTypeFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
