/**
 * Client Types Components
 *
 * This module exports all components related to client type management.
 *
 * Components (per UX_CONCEPT_CLIENT_TYPES.md):
 * - ClientTypesTable: Table/list view of all client types with drag-and-drop reordering
 * - ClientTypeRow: Individual row component for the table (desktop)
 * - ClientTypeCard: Individual card component for mobile view
 * - ClientTypeModal: Modal wrapper for create/edit form
 * - DeleteConfirmModal: Delete confirmation dialog with impact warnings
 */

export { ClientTypesTable } from './ClientTypesTable';
export type { ClientTypesTableProps } from './ClientTypesTable';

export { ClientTypeRow } from './ClientTypeRow';
export type { ClientTypeRowProps } from './ClientTypeRow';

export { ClientTypeCard } from './ClientTypeCard';
export type { ClientTypeCardProps } from './ClientTypeCard';

export { ClientTypeModal } from './ClientTypeModal';

export { DeleteConfirmModal } from './DeleteConfirmModal';
