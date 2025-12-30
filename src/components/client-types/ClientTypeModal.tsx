import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import {
  ClientType,
  ClientTypeFormData,
  ClientTypeFormErrors,
  getInitialFormData,
  clientTypeToFormData,
  validateClientTypeForm,
  hasFormErrors,
} from '../../types/clientType';
import { usePermissions } from '../../contexts/PermissionsContext';

interface ClientTypeModalProps {
  /** Whether the modal is currently visible */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Callback when form is submitted - returns promise for loading state */
  onSubmit: (data: ClientTypeFormData) => Promise<void>;
  /** If provided, modal is in edit mode; otherwise, create mode */
  clientType?: ClientType;
}

/**
 * ClientTypeModal - Modal for creating or editing client types
 *
 * Features:
 * - Create/Edit mode based on clientType prop
 * - Form validation with inline error display
 * - Loading state during submission
 * - Focus management (focus first input on open, trap focus)
 * - Framer Motion enter/exit animations
 * - Responsive: 480px max-width on desktop, full-screen on mobile
 */
export function ClientTypeModal({
  isOpen,
  onClose,
  onSubmit,
  clientType,
}: ClientTypeModalProps) {
  // Permissions
  const { canEdit, inputProps } = usePermissions();

  const isEditMode = Boolean(clientType);
  const modalTitle = isEditMode ? 'Edit Client Type' : 'Add Client Type';
  const submitButtonText = isEditMode ? 'Save Changes' : 'Create Client Type';

  // Form state
  const [formData, setFormData] = useState<ClientTypeFormData>(getInitialFormData());
  const [errors, setErrors] = useState<ClientTypeFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for focus management
  const nameInputRef = useRef<HTMLInputElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset form when modal opens or clientType changes
  useEffect(() => {
    if (isOpen) {
      if (clientType) {
        setFormData(clientTypeToFormData(clientType));
      } else {
        setFormData(getInitialFormData());
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, clientType]);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure modal is rendered
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // Focus trap implementation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab: if on first element, go to last
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: if on last element, go to first
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    },
    []
  );

  // Handle form field changes
  const handleFieldChange = (
    field: keyof ClientTypeFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field as keyof ClientTypeFormErrors]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof ClientTypeFormErrors];
        return newErrors;
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateClientTypeForm(formData);
    if (hasFormErrors(validationErrors)) {
      setErrors(validationErrors);
      // Focus first field with error
      if (validationErrors.name) {
        nameInputRef.current?.focus();
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Success - reset and close
      setFormData(getInitialFormData());
      setErrors({});
      onClose();
    } catch {
      // Error is handled by parent component (shows toast)
      // Keep modal open so user can retry
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle overlay click to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className={cn(
              'relative z-10 bg-white rounded-lg shadow-xl',
              'w-full max-w-md mx-4',
              'max-h-[90vh] overflow-y-auto',
              // Mobile: full screen with small margins
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
                id="modal-title"
                className="text-lg font-semibold"
                style={{ color: 'var(--color-text, #111827)' }}
              >
                {modalTitle}
              </h2>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
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
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-6 space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium"
                    style={{ color: 'var(--color-text, #111827)' }}
                  >
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={nameInputRef}
                    id="name"
                    type="text"
                    className={cn('input', errors.name && 'border-red-500')}
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="e.g., Corporate, VIP, Travel Agent"
                    maxLength={100}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'name-error' : 'name-help'}
                    {...inputProps}
                  />
                  {errors.name && (
                    <p
                      id="name-error"
                      className="flex items-center gap-1 text-sm text-red-600"
                      role="alert"
                    >
                      <AlertCircle size={14} />
                      {errors.name}
                    </p>
                  )}
                  <p
                    id="name-help"
                    className="text-sm"
                    style={{ color: 'var(--color-text-secondary, #6b7280)' }}
                  >
                    Display name shown throughout the system
                  </p>
                </div>

                {/* Description Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium"
                    style={{ color: 'var(--color-text, #111827)' }}
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    className={cn(
                      'input min-h-[100px] resize-y',
                      errors.description && 'border-red-500'
                    )}
                    value={formData.description}
                    onChange={(e) =>
                      handleFieldChange('description', e.target.value)
                    }
                    placeholder="Optional details about this client type..."
                    maxLength={500}
                    aria-invalid={Boolean(errors.description)}
                    aria-describedby={
                      errors.description ? 'description-error' : 'description-help'
                    }
                    {...inputProps}
                  />
                  {errors.description && (
                    <p
                      id="description-error"
                      className="flex items-center gap-1 text-sm text-red-600"
                      role="alert"
                    >
                      <AlertCircle size={14} />
                      {errors.description}
                    </p>
                  )}
                  <p
                    id="description-help"
                    className="text-sm"
                    style={{ color: 'var(--color-text-secondary, #6b7280)' }}
                  >
                    {formData.description.length}/500 characters
                  </p>
                </div>

                {/* Agent Checkbox */}
                <div className="flex items-start gap-3">
                  <input
                    id="agent"
                    type="checkbox"
                    checked={formData.agent}
                    onChange={(e) => handleFieldChange('agent', e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    {...inputProps}
                  />
                  <div>
                    <label
                      htmlFor="agent"
                      className="block text-sm font-medium cursor-pointer"
                      style={{ color: 'var(--color-text, #111827)' }}
                    >
                      Travel Agent / Reseller
                    </label>
                    <p
                      className="text-sm mt-1"
                      style={{ color: 'var(--color-text-secondary, #6b7280)' }}
                    >
                      Enable if this represents a travel agent or reseller account.
                      Agents can make bookings on behalf of customers and may receive
                      different pricing or commission rates.
                    </p>
                  </div>
                </div>

                {/* Active Checkbox */}
                <div className="flex items-start gap-3">
                  <input
                    id="is_active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      handleFieldChange('is_active', e.target.checked)
                    }
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    {...inputProps}
                  />
                  <div>
                    <label
                      htmlFor="is_active"
                      className="block text-sm font-medium cursor-pointer"
                      style={{ color: 'var(--color-text, #111827)' }}
                    >
                      Active
                    </label>
                    <p
                      className="text-sm mt-1"
                      style={{ color: 'var(--color-text-secondary, #6b7280)' }}
                    >
                      Inactive types won&apos;t appear in booking forms
                    </p>
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
                  type="button"
                  className="btn-secondary"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                {canEdit && (
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      submitButtonText
                    )}
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ClientTypeModal;
