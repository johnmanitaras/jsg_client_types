import { useState, useRef, useEffect } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import {
  GripVertical,
  Pencil,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import { ClientType } from '../../types/clientType';
import { cn } from '../../utils/cn';
import { Toggle } from '../common/Toggle';

/**
 * Actions Dropdown Menu Component
 * Simple dropdown menu for row actions
 */
interface ActionsMenuProps {
  clientType: ClientType;
  onEdit: (clientType: ClientType) => void;
  onDelete: (clientType: ClientType) => void;
}

function ActionsMenu({ clientType, onEdit, onDelete }: ActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close menu on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'p-2 rounded-md transition-colors',
          'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500',
          isOpen && 'bg-gray-100'
        )}
        aria-label="Actions menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <MoreHorizontal size={20} className="text-gray-500" />
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute right-0 mt-1 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-20',
            'py-1 focus:outline-none'
          )}
          role="menu"
          aria-orientation="vertical"
        >
          {/* Edit option */}
          <button
            type="button"
            onClick={() => {
              onEdit(clientType);
              setIsOpen(false);
            }}
            className={cn(
              'w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700',
              'hover:bg-gray-100 transition-colors'
            )}
            role="menuitem"
          >
            <Pencil size={16} />
            Edit
          </button>

          {/* Divider */}
          <div className="my-1 h-px bg-gray-200" role="separator" />

          {/* Delete option */}
          <button
            type="button"
            onClick={() => {
              onDelete(clientType);
              setIsOpen(false);
            }}
            className={cn(
              'w-full flex items-center gap-2 px-4 py-2 text-sm',
              'text-red-600 hover:bg-red-50 transition-colors'
            )}
            role="menuitem"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * ClientTypeRow Component Props
 */
export interface ClientTypeRowProps {
  clientType: ClientType;
  index: number;
  onEdit: (clientType: ClientType) => void;
  onDelete: (clientType: ClientType) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
}

/**
 * ClientTypeRow Component
 *
 * Renders a single row in the client types table with:
 * - Drag handle for reordering
 * - Name
 * - Description with truncation and tooltip
 * - Agent badge
 * - Client count
 * - Status toggle
 * - Actions dropdown menu
 */
export function ClientTypeRow({
  clientType,
  index,
  onEdit,
  onDelete,
  onToggleStatus,
}: ClientTypeRowProps) {

  return (
    <Draggable draggableId={String(clientType.id)} index={index}>
      {(provided, snapshot) => (
        <tr
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            'transition-colors',
            snapshot.isDragging
              ? 'bg-blue-50 shadow-lg'
              : 'hover:bg-gray-50',
            !clientType.is_active && 'opacity-60'
          )}
        >
          {/* Drag Handle */}
          <td className="w-10 px-3 py-4">
            <button
              type="button"
              {...provided.dragHandleProps}
              className={cn(
                'cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 rounded'
              )}
              aria-label="Drag to reorder"
            >
              <GripVertical size={20} />
            </button>
          </td>

          {/* Name */}
          <td className="px-6 py-4">
            <span className="font-medium text-gray-900">{clientType.name}</span>
          </td>

          {/* Description with tooltip */}
          <td className="px-6 py-4">
            <span
              className="text-gray-500 truncate max-w-xs block text-sm"
              title={clientType.description || ''}
            >
              {clientType.description || '\u2014'}
            </span>
          </td>

          {/* Agent Badge */}
          <td className="px-4 py-4 text-center">
            {clientType.agent && (
              <span className="badge badge-info">Agent</span>
            )}
          </td>

          {/* Client Count */}
          <td className="px-4 py-4 text-left">
            <span className="text-gray-600 text-sm">
              {clientType.client_count.toLocaleString()} client
              {clientType.client_count !== 1 ? 's' : ''}
            </span>
          </td>

          {/* Status Toggle */}
          <td className="px-4 py-4 text-center">
            <Toggle
              checked={clientType.is_active}
              onChange={(checked) => onToggleStatus(clientType.id, checked)}
              aria-label={`${clientType.is_active ? 'Deactivate' : 'Activate'} ${clientType.name}`}
            />
          </td>

          {/* Actions Menu */}
          <td className="w-16 px-3 py-4">
            <ActionsMenu
              clientType={clientType}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </td>
        </tr>
      )}
    </Draggable>
  );
}

export default ClientTypeRow;
