import { useState, useCallback, useEffect } from 'react';
import {
  DragDropContext,
  Droppable,
  DropResult,
} from '@hello-pangea/dnd';
import { ArrowUpDown, Check } from 'lucide-react';
import { ClientType, SortOrderUpdate } from '../../types/clientType';
import { ClientTypeRow } from './ClientTypeRow';
import { ClientTypeCard } from './ClientTypeCard';
import { cn } from '../../utils/cn';

/**
 * ClientTypesTable Component Props
 */
export interface ClientTypesTableProps {
  /** Array of client types to display */
  clientTypes: ClientType[];
  /** Callback when edit is requested for a client type */
  onEdit: (clientType: ClientType) => void;
  /** Callback when status toggle is changed */
  onToggleStatus: (id: string, isActive: boolean) => void;
  /** Callback when rows are reordered via drag-and-drop */
  onReorder: (updates: SortOrderUpdate[]) => void;
}

/**
 * ClientTypesTable Component
 *
 * Renders client types with responsive layout:
 * - Desktop (>= 768px): Table view with drag-and-drop reordering
 * - Mobile (< 768px): Card-based list view with tap-to-expand and "Edit Order" mode
 *
 * Per UX_CONCEPT_CLIENT_TYPES.md sections 4 and 8:
 * - Uses container queries for embedded mode responsive behavior
 * - Table columns: Drag Handle, Name, Description, Type (Agent badge), In Use, Status, Actions
 * - Mobile cards: Name with star, client count, agent badge, status toggle, expandable actions
 */
export function ClientTypesTable({
  clientTypes,
  onEdit,
  onToggleStatus,
  onReorder,
}: ClientTypesTableProps) {
  // Mobile edit order mode state
  const [isEditOrderMode, setIsEditOrderMode] = useState(false);
  // Local state for optimistic reordering in mobile edit mode
  const [localClientTypes, setLocalClientTypes] = useState<ClientType[]>(clientTypes);
  // Track if there are pending changes in edit order mode
  const [hasOrderChanges, setHasOrderChanges] = useState(false);

  // Sync local state with props when not in edit mode
  useEffect(() => {
    if (!isEditOrderMode) {
      setLocalClientTypes(clientTypes);
    }
  }, [clientTypes, isEditOrderMode]);

  /**
   * Handle drag end - calculate new sort orders and call onReorder
   */
  const handleDragEnd = useCallback(
    (result: DropResult) => {
      // Dropped outside the list
      if (!result.destination) {
        return;
      }

      const sourceIndex = result.source.index;
      const destinationIndex = result.destination.index;

      // No change in position
      if (sourceIndex === destinationIndex) {
        return;
      }

      // Create a copy of the client types array
      const reordered = Array.from(clientTypes);
      const [removed] = reordered.splice(sourceIndex, 1);
      reordered.splice(destinationIndex, 0, removed);

      // Calculate sort order updates for all affected items
      // We update sort_order for all items to maintain consistent ordering
      const updates: SortOrderUpdate[] = reordered.map((item, index) => ({
        id: item.id,
        sort_order: index,
      }));

      // Only send updates for items whose sort_order actually changed
      const changedUpdates = updates.filter((update) => {
        const original = clientTypes.find((ct) => ct.id === update.id);
        return original && original.sort_order !== update.sort_order;
      });

      if (changedUpdates.length > 0) {
        onReorder(changedUpdates);
      }
    },
    [clientTypes, onReorder]
  );

  /**
   * Handle mobile move up
   */
  const handleMoveUp = useCallback((index: number) => {
    if (index <= 0) return;

    setLocalClientTypes((prev) => {
      const reordered = [...prev];
      const temp = reordered[index - 1];
      reordered[index - 1] = reordered[index];
      reordered[index] = temp;
      return reordered;
    });
    setHasOrderChanges(true);
  }, []);

  /**
   * Handle mobile move down
   */
  const handleMoveDown = useCallback((index: number) => {
    setLocalClientTypes((prev) => {
      if (index >= prev.length - 1) return prev;

      const reordered = [...prev];
      const temp = reordered[index + 1];
      reordered[index + 1] = reordered[index];
      reordered[index] = temp;
      return reordered;
    });
    setHasOrderChanges(true);
  }, []);

  /**
   * Enter edit order mode
   */
  const handleStartEditOrder = useCallback(() => {
    setLocalClientTypes(clientTypes);
    setIsEditOrderMode(true);
    setHasOrderChanges(false);
  }, [clientTypes]);

  /**
   * Save changes and exit edit order mode
   */
  const handleSaveOrder = useCallback(() => {
    if (hasOrderChanges) {
      // Calculate sort order updates
      const updates: SortOrderUpdate[] = localClientTypes.map((item, index) => ({
        id: item.id,
        sort_order: index,
      }));

      // Only send updates for items whose sort_order actually changed
      const changedUpdates = updates.filter((update) => {
        const original = clientTypes.find((ct) => ct.id === update.id);
        return original && original.sort_order !== update.sort_order;
      });

      if (changedUpdates.length > 0) {
        onReorder(changedUpdates);
      }
    }

    setIsEditOrderMode(false);
    setHasOrderChanges(false);
  }, [localClientTypes, clientTypes, hasOrderChanges, onReorder]);

  /**
   * Cancel edit order mode without saving
   */
  const handleCancelEditOrder = useCallback(() => {
    setLocalClientTypes(clientTypes);
    setIsEditOrderMode(false);
    setHasOrderChanges(false);
  }, [clientTypes]);

  // Use local state for mobile view when in edit mode, otherwise use props
  const displayClientTypes = isEditOrderMode ? localClientTypes : clientTypes;

  return (
    <div
      className="client-types-container"
      style={{ containerType: 'inline-size', containerName: 'client-types' }}
    >
      {/* Desktop Table View */}
      <div className="client-types-table-wrapper">
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <DragDropContext onDragEnd={handleDragEnd}>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {/* Drag Handle Column - no header text */}
                    <th className="w-10 px-3 py-3" scope="col">
                      <span className="sr-only">Reorder</span>
                    </th>

                    {/* Name Column */}
                    <th
                      scope="col"
                      className={cn(
                        'px-6 py-3 text-left',
                        'text-xs font-medium text-gray-500 uppercase tracking-wider'
                      )}
                      style={{ minWidth: '150px' }}
                    >
                      Name
                    </th>

                    {/* Description Column */}
                    <th
                      scope="col"
                      className={cn(
                        'px-6 py-3 text-left',
                        'text-xs font-medium text-gray-500 uppercase tracking-wider'
                      )}
                      style={{ minWidth: '200px' }}
                    >
                      Description
                    </th>

                    {/* Type Column (Agent badge) */}
                    <th
                      scope="col"
                      className={cn(
                        'w-20 px-4 py-3 text-center',
                        'text-xs font-medium text-gray-500 uppercase tracking-wider'
                      )}
                    >
                      Type
                    </th>

                    {/* In Use Column (Client count) */}
                    <th
                      scope="col"
                      className={cn(
                        'px-4 py-3 text-left',
                        'text-xs font-medium text-gray-500 uppercase tracking-wider'
                      )}
                      style={{ width: '100px' }}
                    >
                      In Use
                    </th>

                    {/* Status Column */}
                    <th
                      scope="col"
                      className={cn(
                        'w-20 px-4 py-3 text-center',
                        'text-xs font-medium text-gray-500 uppercase tracking-wider'
                      )}
                    >
                      Status
                    </th>

                    {/* Actions Column - no header text */}
                    <th className="w-16 px-3 py-3" scope="col">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>

                <Droppable droppableId="client-types-table">
                  {(provided, snapshot) => (
                    <tbody
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        'bg-white divide-y divide-gray-200',
                        snapshot.isDraggingOver && 'bg-blue-50/30'
                      )}
                    >
                      {clientTypes.map((clientType, index) => (
                        <ClientTypeRow
                          key={clientType.id}
                          clientType={clientType}
                          index={index}
                          onEdit={onEdit}
                          onToggleStatus={onToggleStatus}
                        />
                      ))}
                      {provided.placeholder}
                    </tbody>
                  )}
                </Droppable>
              </table>
            </DragDropContext>
          </div>

          {/* Table footer - showing count */}
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              Showing {clientTypes.length} client type{clientTypes.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="client-types-mobile-wrapper">
        <div className="card overflow-hidden">
          {/* Mobile header with Edit Order button */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {displayClientTypes.length} client type{displayClientTypes.length !== 1 ? 's' : ''}
            </p>

            {isEditOrderMode ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancelEditOrder}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-md',
                    'text-gray-600 hover:bg-gray-200 transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500'
                  )}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveOrder}
                  className={cn(
                    'flex items-center gap-1 px-3 py-1.5 text-sm rounded-md',
                    'bg-emerald-600 text-white hover:bg-emerald-700 transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-emerald-500'
                  )}
                >
                  <Check size={16} />
                  Done
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleStartEditOrder}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 text-sm rounded-md',
                  'text-gray-600 hover:bg-gray-200 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500'
                )}
              >
                <ArrowUpDown size={16} />
                Edit Order
              </button>
            )}
          </div>

          {/* Mobile card list */}
          <div>
            {displayClientTypes.map((clientType, index) => (
              <ClientTypeCard
                key={clientType.id}
                clientType={clientType}
                index={index}
                totalCount={displayClientTypes.length}
                onEdit={onEdit}
                onToggleStatus={onToggleStatus}
                isEditOrderMode={isEditOrderMode}
                onMoveUp={() => handleMoveUp(index)}
                onMoveDown={() => handleMoveDown(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Container query CSS */}
      <style>{`
        /* Default: Show table, hide mobile */
        .client-types-table-wrapper {
          display: block;
        }
        .client-types-mobile-wrapper {
          display: none;
        }

        /* Container query: Switch at 768px */
        @container client-types (max-width: 767px) {
          .client-types-table-wrapper {
            display: none;
          }
          .client-types-mobile-wrapper {
            display: block;
          }
        }

        /* Fallback media query for browsers without container query support */
        @supports not (container-type: inline-size) {
          @media (max-width: 767px) {
            .client-types-table-wrapper {
              display: none;
            }
            .client-types-mobile-wrapper {
              display: block;
            }
          }
        }
      `}</style>
    </div>
  );
}

export default ClientTypesTable;
