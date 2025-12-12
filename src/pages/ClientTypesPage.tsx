import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, RefreshCw, Users } from 'lucide-react';
import { useClientTypes } from '../hooks/useClientTypes';
import {
  ClientTypesTable,
  ClientTypeModal,
} from '../components/client-types';
import { Toast } from '../components/common/Toast';
import { ToastType, ToastState, initialToastState } from '../types/toast';
import { ClientType, ClientTypeFormData, StatusFilter, SortOrderUpdate } from '../types/clientType';

/**
 * ClientTypesPage - Main page for managing client type classifications
 *
 * This is a configuration screen where operators manage customer classifications
 * (e.g., "Individual", "Corporate", "Travel Agent", "VIP") used throughout
 * the JetSetGo platform for categorization, pricing rules, and agent features.
 */
export function ClientTypesPage() {
  // Data hook for client types
  const {
    clientTypes,
    isLoading,
    error,
    fetchClientTypes,
    createClientType,
    updateClientType,
    updateSortOrder,
    toggleActiveStatus,
  } = useClientTypes();

  // Local UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClientType, setEditingClientType] = useState<ClientType | null>(null);

  // Toast state
  const [toast, setToast] = useState<ToastState>(initialToastState);

  // Filter client types based on search query and status filter
  const filteredClientTypes = useMemo(() => {
    return clientTypes.filter((clientType) => {
      // Search filter - match name or description
      const searchLower = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !searchLower ||
        clientType.name.toLowerCase().includes(searchLower) ||
        (clientType.description?.toLowerCase().includes(searchLower) ?? false);

      // Status filter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && clientType.is_active) ||
        (statusFilter === 'inactive' && !clientType.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [clientTypes, searchQuery, statusFilter]);

  // Page animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  // Toast helper functions
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type, isVisible: true });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }));
  }, []);

  // Handle retry on error
  const handleRetry = useCallback(() => {
    fetchClientTypes();
  }, [fetchClientTypes]);

  // Modal handlers
  const handleOpenCreateModal = useCallback(() => {
    setEditingClientType(null);
    setIsCreateModalOpen(true);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
    setEditingClientType(null);
  }, []);

  // Edit handler - opens modal in edit mode
  const handleEdit = useCallback((clientType: ClientType) => {
    setEditingClientType(clientType);
    setIsCreateModalOpen(true);
  }, []);

  // Create/Edit submit handler
  const handleSubmit = useCallback(async (formData: ClientTypeFormData) => {
    try {
      if (editingClientType) {
        // Update existing client type
        await updateClientType(editingClientType.id, {
          name: formData.name,
          description: formData.description || null,
          agent: formData.agent,
          is_active: formData.is_active,
        });
        showToast(`"${formData.name}" has been updated`, 'success');
      } else {
        // Create new client type
        await createClientType({
          name: formData.name,
          description: formData.description || null,
          agent: formData.agent,
          is_active: formData.is_active,
        });
        showToast(`"${formData.name}" has been created`, 'success');
      }
    } catch (err) {
      const action = editingClientType ? 'update' : 'create';
      const message = err instanceof Error ? err.message : `Failed to ${action} client type`;
      showToast(message, 'error');
      throw err; // Re-throw to keep modal open
    }
  }, [editingClientType, createClientType, updateClientType, showToast]);

  // Toggle status handler
  const handleToggleStatus = useCallback(async (id: string, isActive: boolean) => {
    const clientType = clientTypes.find(ct => ct.id === id);
    if (!clientType) return;

    try {
      await toggleActiveStatus(id, isActive);
      const status = isActive ? 'activated' : 'deactivated';
      showToast(`"${clientType.name}" has been ${status}`, 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update status';
      showToast(message, 'error');
    }
  }, [clientTypes, toggleActiveStatus, showToast]);

  // Reorder handler
  const handleReorder = useCallback(async (updates: SortOrderUpdate[]) => {
    try {
      await updateSortOrder(updates);
      showToast('Sort order updated', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update sort order';
      showToast(message, 'error');
    }
  }, [updateSortOrder, showToast]);

  return (
    <motion.div
      className="container py-6"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--color-text, #111827)' }}
          >
            Client Types
          </h1>
          <p
            className="text-sm mt-2"
            style={{ color: 'var(--color-text-secondary, #6b7280)' }}
          >
            Manage customer classifications for your booking system
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={handleOpenCreateModal}
        >
          <Plus size={20} className="mr-2" />
          Add Client Type
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-text-secondary, #9ca3af)' }}
              />
              <input
                type="text"
                placeholder="Search client types..."
                className="input pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search client types"
              />
            </div>

            {/* Status Filter Dropdown */}
            <select
              className="select"
              style={{ width: '12rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        // Loading Skeleton
        <div className="card">
          <div className="card-body">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 py-4"
                style={{
                  borderBottom: i < 4 ? '1px solid var(--color-divider, #f3f4f6)' : 'none',
                }}
              >
                <div
                  className="w-6 h-6 rounded animate-pulse"
                  style={{ backgroundColor: 'var(--color-gray-200, #e5e7eb)' }}
                />
                <div className="flex-1">
                  <div
                    className="h-4 w-32 rounded animate-pulse"
                    style={{ backgroundColor: 'var(--color-gray-200, #e5e7eb)' }}
                  />
                  <div
                    className="h-3 w-48 rounded animate-pulse mt-2"
                    style={{ backgroundColor: 'var(--color-gray-100, #f3f4f6)' }}
                  />
                </div>
                <div
                  className="w-16 h-4 rounded animate-pulse"
                  style={{ backgroundColor: 'var(--color-gray-200, #e5e7eb)' }}
                />
                <div
                  className="w-11 h-6 rounded-full animate-pulse"
                  style={{ backgroundColor: 'var(--color-gray-200, #e5e7eb)' }}
                />
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        // Error State
        <div className="card">
          <div className="card-body">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: 'color-mix(in srgb, var(--color-error-600, #dc2626) 10%, transparent)' }}
              >
                <RefreshCw
                  size={32}
                  style={{ color: 'var(--color-error-600, #dc2626)' }}
                />
              </div>
              <h3
                className="text-lg font-medium mb-2"
                style={{ color: 'var(--color-text, #111827)' }}
              >
                Failed to load client types
              </h3>
              <p
                className="text-sm mb-6 max-w-md"
                style={{ color: 'var(--color-text-secondary, #6b7280)' }}
              >
                We couldn&apos;t load your client types. Please check your connection and try again.
              </p>
              <button
                className="btn-primary"
                onClick={handleRetry}
              >
                <RefreshCw size={20} className="mr-2" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      ) : clientTypes.length === 0 ? (
        // Empty State (No Client Types)
        <div className="card">
          <div className="card-body">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary-600, #2563eb) 10%, transparent)' }}
              >
                <Users
                  size={32}
                  style={{ color: 'var(--color-primary-600, #2563eb)' }}
                />
              </div>
              <h3
                className="text-lg font-medium mb-2"
                style={{ color: 'var(--color-text, #111827)' }}
              >
                No client types yet
              </h3>
              <p
                className="text-sm mb-6 max-w-md"
                style={{ color: 'var(--color-text-secondary, #6b7280)' }}
              >
                Client types help you categorize customers and apply different pricing or policies.
                Create your first client type to get started.
              </p>
              <button
                className="btn-primary"
                onClick={handleOpenCreateModal}
              >
                <Plus size={20} className="mr-2" />
                Add Client Type
              </button>
            </div>
          </div>
        </div>
      ) : filteredClientTypes.length === 0 ? (
        // Empty Search Results State
        <div className="card">
          <div className="card-body">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: 'color-mix(in srgb, var(--color-gray-500, #6b7280) 10%, transparent)' }}
              >
                <Search
                  size={32}
                  style={{ color: 'var(--color-gray-500, #6b7280)' }}
                />
              </div>
              <h3
                className="text-lg font-medium mb-2"
                style={{ color: 'var(--color-text, #111827)' }}
              >
                No matching client types
              </h3>
              <p
                className="text-sm mb-6 max-w-md"
                style={{ color: 'var(--color-text-secondary, #6b7280)' }}
              >
                No client types match &quot;{searchQuery}&quot;. Try a different search term.
              </p>
              <button
                className="btn-secondary"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
              >
                Clear Search
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Client Types Table
        <ClientTypesTable
          clientTypes={filteredClientTypes}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onReorder={handleReorder}
        />
      )}

      {/* Create/Edit Modal */}
      <ClientTypeModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSubmit={handleSubmit}
        clientType={editingClientType ?? undefined}
      />

      {/* Toast Notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </motion.div>
  );
}

export default ClientTypesPage;
