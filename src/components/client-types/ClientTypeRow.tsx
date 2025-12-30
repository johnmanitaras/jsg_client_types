import { Draggable } from '@hello-pangea/dnd';
import {
  GripVertical,
  Pencil,
} from 'lucide-react';
import { ClientType } from '../../types/clientType';
import { cn } from '../../utils/cn';
import { Toggle } from '../common/Toggle';

/**
 * ClientTypeRow Component Props
 */
export interface ClientTypeRowProps {
  clientType: ClientType;
  index: number;
  onEdit: (clientType: ClientType) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  /** Whether the user can edit (from permissions) */
  canEdit?: boolean;
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
 * - Edit icon button
 */
export function ClientTypeRow({
  clientType,
  index,
  onEdit,
  onToggleStatus,
  canEdit = true,
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
              disabled={!canEdit}
            />
          </td>

          {/* Edit Button */}
          <td className="w-16 px-3 py-4">
            {canEdit && (
              <button
                type="button"
                onClick={() => onEdit(clientType)}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
                  'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500'
                )}
                aria-label={`Edit ${clientType.name}`}
              >
                <Pencil size={18} />
              </button>
            )}
          </td>
        </tr>
      )}
    </Draggable>
  );
}

export default ClientTypeRow;
