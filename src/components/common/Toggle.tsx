import { cn } from '../../utils/cn';

/**
 * Toggle Switch Component
 *
 * An accessible toggle switch for active/inactive status.
 * Supports keyboard navigation and screen readers.
 */
export interface ToggleProps {
  /** Whether the toggle is checked/on */
  checked: boolean;
  /** Callback when toggle state changes */
  onChange: (checked: boolean) => void;
  /** Whether the toggle is disabled */
  disabled?: boolean;
  /** Accessible label for screen readers */
  'aria-label'?: string;
}

export function Toggle({
  checked,
  onChange,
  disabled,
  'aria-label': ariaLabel,
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onChange(!checked);
      }}
      className={cn(
        'relative inline-flex h-6 w-11 items-center transition-colors flex-shrink-0',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      style={{
        borderRadius: 'var(--radius-full, 9999px)',
        backgroundColor: checked
          ? 'var(--color-success-600, #059669)'
          : 'var(--color-gray-300, #d1d5db)',
        // Focus ring color handled via CSS variable
        '--tw-ring-color': checked
          ? 'var(--color-success-500, #10b981)'
          : 'var(--color-gray-400, #9ca3af)',
      } as React.CSSProperties}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 transform bg-white shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-1'
        )}
        style={{ borderRadius: 'var(--radius-full, 9999px)' }}
      />
    </button>
  );
}

export default Toggle;
