import { useState } from 'react';
import {
  GripVertical,
  Pencil,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { ClientType } from '../../types/clientType';
import { cn } from '../../utils/cn';
import { Toggle } from '../common/Toggle';

/**
 * Mobile Edit Button (shown on expansion)
 */
interface MobileActionsProps {
  clientType: ClientType;
  onEdit: (clientType: ClientType) => void;
  isExpanded: boolean;
}

function MobileActions({
  clientType,
  onEdit,
  isExpanded,
}: MobileActionsProps) {
  if (!isExpanded) return null;

  return (
    <div
      className={cn(
        'mt-3 pt-3 border-t border-gray-200',
        'flex flex-wrap gap-2'
      )}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(clientType);
        }}
        className={cn(
          'flex items-center gap-2 px-3 py-2 text-sm rounded-md',
          'bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-500'
        )}
      >
        <Pencil size={16} />
        Edit
      </button>
    </div>
  );
}

/**
 * Reorder Buttons for Edit Order Mode
 */
interface ReorderButtonsProps {
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

function ReorderButtons({ onMoveUp, onMoveDown, canMoveUp, canMoveDown }: ReorderButtonsProps) {
  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onMoveUp();
        }}
        disabled={!canMoveUp}
        className={cn(
          'p-1 rounded transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          canMoveUp
            ? 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
            : 'text-gray-300 cursor-not-allowed'
        )}
        aria-label="Move up"
      >
        <ChevronUp size={20} />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onMoveDown();
        }}
        disabled={!canMoveDown}
        className={cn(
          'p-1 rounded transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          canMoveDown
            ? 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
            : 'text-gray-300 cursor-not-allowed'
        )}
        aria-label="Move down"
      >
        <ChevronDown size={20} />
      </button>
    </div>
  );
}

/**
 * ClientTypeCard Component Props
 */
export interface ClientTypeCardProps {
  clientType: ClientType;
  index: number;
  totalCount: number;
  onEdit: (clientType: ClientType) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  /** Whether edit order mode is active */
  isEditOrderMode: boolean;
  /** Callback to move this item up in the list */
  onMoveUp: () => void;
  /** Callback to move this item down in the list */
  onMoveDown: () => void;
}

/**
 * ClientTypeCard Component
 *
 * Mobile-optimized card view for a single client type.
 *
 * Layout:
 * ```
 * +-------------------------------+
 * | = Individual            [===] |
 * |   1,247 clients               |
 * +-------------------------------+
 * ```
 *
 * Features:
 * - Name
 * - Client count on second line
 * - Agent badge (if applicable)
 * - Status toggle directly accessible
 * - Tap to expand for edit action
 * - In edit order mode: up/down arrows instead of drag handle
 */
export function ClientTypeCard({
  clientType,
  index,
  totalCount,
  onEdit,
  onToggleStatus,
  isEditOrderMode,
  onMoveUp,
  onMoveDown,
}: ClientTypeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const canMoveUp = index > 0;
  const canMoveDown = index < totalCount - 1;

  const handleCardClick = () => {
    if (!isEditOrderMode) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div
      className={cn(
        'bg-white border-b border-gray-200 transition-colors',
        !clientType.is_active && 'opacity-60',
        !isEditOrderMode && 'cursor-pointer',
        isExpanded && 'bg-gray-50'
      )}
      onClick={handleCardClick}
      role={isEditOrderMode ? undefined : 'button'}
      tabIndex={isEditOrderMode ? undefined : 0}
      onKeyDown={(e) => {
        if (!isEditOrderMode && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          setIsExpanded(!isExpanded);
        }
      }}
      aria-expanded={isEditOrderMode ? undefined : isExpanded}
    >
      <div className="px-4 py-3">
        {/* Top row: Drag handle / reorder buttons, Name, Agent badge, Toggle */}
        <div className="flex items-center gap-3">
          {/* Left: Drag handle or reorder buttons */}
          {isEditOrderMode ? (
            <ReorderButtons
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              canMoveUp={canMoveUp}
              canMoveDown={canMoveDown}
            />
          ) : (
            <div className="text-gray-400 flex-shrink-0">
              <GripVertical size={20} />
            </div>
          )}

          {/* Center: Name + Agent badge */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 truncate">
                {clientType.name}
              </span>
              {clientType.agent && (
                <span className="badge badge-info flex-shrink-0 ml-1">
                  Agent
                </span>
              )}
            </div>
          </div>

          {/* Right: Status toggle */}
          <Toggle
            checked={clientType.is_active}
            onChange={(checked) => onToggleStatus(clientType.id, checked)}
            aria-label={`${clientType.is_active ? 'Deactivate' : 'Activate'} ${clientType.name}`}
          />
        </div>

        {/* Second row: Client count + status indicators */}
        <div className="flex items-center gap-2 mt-1 ml-8 text-sm text-gray-500">
          <span>
            {clientType.client_count.toLocaleString()} client
            {clientType.client_count !== 1 ? 's' : ''}
          </span>
          {!clientType.is_active && (
            <>
              <span className="text-gray-300">*</span>
              <span className="text-gray-400">Inactive</span>
            </>
          )}
        </div>

        {/* Expanded actions */}
        <MobileActions
          clientType={clientType}
          onEdit={onEdit}
          isExpanded={isExpanded && !isEditOrderMode}
        />
      </div>
    </div>
  );
}

export default ClientTypeCard;
