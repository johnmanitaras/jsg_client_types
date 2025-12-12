import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, AlertTriangle, X, Info } from 'lucide-react';
import { useEffect } from 'react';
import { ToastType } from '../../types/toast';

interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
  /** Duration in milliseconds before auto-close. Default: 5000. Set to 0 to disable auto-close. */
  duration?: number;
}

/**
 * Toast notification component with support for different message types.
 *
 * Types:
 * - success: Green checkmark icon for success messages
 * - error: Red alert icon for error messages
 * - warning: Yellow/orange warning icon for warnings
 * - info: Blue info icon for informational messages
 */
export function Toast({
  message,
  type = 'error',
  isVisible,
  onClose,
  duration = 5000,
}: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  // Icon and color configuration based on toast type
  const config = {
    success: {
      icon: CheckCircle,
      color: 'var(--color-success-600, #16a34a)',
      bgColor: 'var(--color-success-50, #f0fdf4)',
      borderColor: 'var(--color-success-200, #bbf7d0)',
    },
    error: {
      icon: AlertCircle,
      color: 'var(--color-error-600, #dc2626)',
      bgColor: 'var(--color-error-50, #fef2f2)',
      borderColor: 'var(--color-error-200, #fecaca)',
    },
    warning: {
      icon: AlertTriangle,
      color: 'var(--color-warning-600, #d97706)',
      bgColor: 'var(--color-warning-50, #fffbeb)',
      borderColor: 'var(--color-warning-200, #fde68a)',
    },
    info: {
      icon: Info,
      color: 'var(--color-info-600, #2563eb)',
      bgColor: 'var(--color-info-50, #eff6ff)',
      borderColor: 'var(--color-info-200, #bfdbfe)',
    },
  };

  const { icon: Icon, color, bgColor, borderColor } = config[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div
            className="bg-white rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-80 max-w-md"
            style={{
              backgroundColor: bgColor,
              border: `1px solid ${borderColor}`,
            }}
          >
            <Icon
              className="h-5 w-5 flex-shrink-0"
              style={{ color }}
            />
            <p
              className="flex-grow text-sm"
              style={{ color: 'var(--color-text, #111827)' }}
            >
              {message}
            </p>
            <button
              onClick={onClose}
              className="text-[var(--color-text-tertiary,#9ca3af)] hover:text-[var(--color-text-secondary,#6b7280)] transition-colors duration-150"
              aria-label="Close notification"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
