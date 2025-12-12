import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { ClientType } from '../../types/clientType';

interface DeleteConfirmModalProps {
  /** Whether the modal is currently visible */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Callback when delete is confirmed - returns promise for loading state */
  onConfirm: () => Promise<void>;
  /** The client type to be deleted */
  clientType: ClientType | null;
}

/**
 * DeleteConfirmModal - Modal for confirming client type deletion
 *
 * Features:
 * - Warning icon in red circle background
 * - Shows client count impact warning if clients are using this type
 * - Requires checkbox acknowledgment when clients will be affected
 * - Blocks deletion of default types with explanatory message
 * - Loading state during deletion
 * - Framer Motion enter/exit animations
 * - Focus management and keyboard accessibility
 */
export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  clientType,
}: DeleteConfirmModalProps) {
  // State for acknowledgment checkbox and loading
  const [acknowledgeImpact, setAcknowledgeImpact] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Refs for focus management
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset acknowledgment when modal opens/closes or clientType changes
  useEffect(() => {
    if (isOpen) {
      setAcknowledgeImpact(false);
      setIsDeleting(false);
    }
  }, [isOpen, clientType]);

  // Focus cancel button when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  // Focus trap implementation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    },
    []
  );

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!clientType || clientType.is_default) return;
    if (clientType.client_count > 0 && !acknowledgeImpact) return;

    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      // Error is handled by parent component (shows toast)
      // Keep modal open so user can retry
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle overlay click to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onClose();
    }
  };

  // Determine if delete button should be disabled
  const isDeleteDisabled =
    isDeleting ||
    !clientType ||
    clientType.is_default ||
    (clientType.client_count > 0 && !acknowledgeImpact);

  // Format client count with proper pluralization
  const formatClientCount = (count: number) => {
    return `${count.toLocaleString()} client${count !== 1 ? 's' : ''}`;
  };

  return (
    <AnimatePresence>
      {isOpen && clientType && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop overlay */}
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleOverlayClick}
            aria-hidden="true"
          />

          {/* Modal content */}
          <motion.div
            ref={modalRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            aria-describedby="delete-modal-description"
            className={cn(
              'relative z-10 bg-white rounded-lg shadow-xl',
              'w-full max-w-md mx-4',
              'max-h-[90vh] overflow-y-auto',
              'sm:mx-auto sm:max-w-[480px]'
            )}
            style={{
              maxWidth: '480px',
            }}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onKeyDown={handleKeyDown}
          >
            {/* Modal Header */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: 'var(--color-border, #e5e7eb)' }}
            >
              <h2
                id="delete-modal-title"
                className="text-lg font-semibold"
                style={{ color: 'var(--color-text, #111827)' }}
              >
                Delete Client Type
              </h2>
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  'hover:bg-gray-100 focus:outline-none focus:ring-2',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                style={{
                  color: 'var(--color-text-secondary, #6b7280)',
                }}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6">
              <div className="flex items-start gap-4">
                {/* Warning Icon */}
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-error-100, #fee2e2)' }}
                >
                  <AlertTriangle
                    size={20}
                    style={{ color: 'var(--color-error-600, #dc2626)' }}
                  />
                </div>

                <div className="flex-1" id="delete-modal-description">
                  {/* Default Type Block Message */}
                  {clientType.is_default ? (
                    <>
                      <p
                        className="font-medium"
                        style={{ color: 'var(--color-text, #111827)' }}
                      >
                        Cannot delete &quot;{clientType.name}&quot;
                      </p>
                      <div
                        className="mt-3 p-3 rounded-md"
                        style={{
                          backgroundColor: 'var(--color-error-50, #fef2f2)',
                          border: '1px solid var(--color-error-200, #fecaca)',
                        }}
                      >
                        <p
                          className="text-sm"
                          style={{ color: 'var(--color-error-800, #991b1b)' }}
                        >
                          This is the default client type and cannot be deleted.
                          Default types are automatically assigned to new clients
                          and walk-up customers.
                        </p>
                        <p
                          className="text-sm mt-2"
                          style={{ color: 'var(--color-error-700, #b91c1c)' }}
                        >
                          To delete this type, first set a different client type
                          as the default.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Delete Confirmation Message */}
                      <p
                        className="font-medium"
                        style={{ color: 'var(--color-text, #111827)' }}
                      >
                        Are you sure you want to delete &quot;{clientType.name}&quot;?
                      </p>

                      {/* Impact Warning - show when client count > 0 */}
                      {clientType.client_count > 0 && (
                        <div
                          className="mt-3 p-3 rounded-md"
                          style={{
                            backgroundColor: 'var(--color-warning-50, #fffbeb)',
                            border: '1px solid var(--color-warning-200, #fde68a)',
                          }}
                        >
                          <p
                            className="text-sm font-medium flex items-center gap-1"
                            style={{ color: 'var(--color-warning-800, #92400e)' }}
                          >
                            <AlertTriangle size={16} />
                            This type is currently used by{' '}
                            {formatClientCount(clientType.client_count)}.
                          </p>
                          <p
                            className="text-sm mt-1"
                            style={{ color: 'var(--color-warning-700, #b45309)' }}
                          >
                            Deleting it will require reassigning all clients to a
                            different type.
                          </p>
                        </div>
                      )}

                      {/* No clients message */}
                      {clientType.client_count === 0 && (
                        <p
                          className="text-sm mt-2"
                          style={{ color: 'var(--color-text-secondary, #6b7280)' }}
                        >
                          This client type is not currently in use.
                        </p>
                      )}

                      {/* Acknowledgment checkbox - only show when clients are affected */}
                      {clientType.client_count > 0 && (
                        <label className="flex items-start gap-2 mt-4 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={acknowledgeImpact}
                            onChange={(e) => setAcknowledgeImpact(e.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            disabled={isDeleting}
                          />
                          <span
                            className="text-sm"
                            style={{ color: 'var(--color-text-secondary, #6b7280)' }}
                          >
                            I understand that all{' '}
                            {formatClientCount(clientType.client_count)} will need
                            to be reassigned
                          </span>
                        </label>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className="flex items-center justify-end gap-3 px-6 py-4 border-t"
              style={{
                borderColor: 'var(--color-border, #e5e7eb)',
                backgroundColor: 'var(--color-gray-50, #f9fafb)',
              }}
            >
              <button
                ref={cancelButtonRef}
                type="button"
                className="btn-secondary"
                onClick={onClose}
                disabled={isDeleting}
              >
                Cancel
              </button>
              {!clientType.is_default && (
                <button
                  type="button"
                  className={cn(
                    'btn-primary',
                    'bg-red-600 hover:bg-red-700 focus:ring-red-500',
                    'disabled:bg-red-400 disabled:cursor-not-allowed'
                  )}
                  onClick={handleConfirmDelete}
                  disabled={isDeleteDisabled}
                  style={{
                    backgroundColor: isDeleteDisabled
                      ? 'var(--color-error-400, #f87171)'
                      : 'var(--color-error-600, #dc2626)',
                  }}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Client Type'
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default DeleteConfirmModal;
