import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { rectSortingStrategy, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Loader2, Plus } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SpaceSettingsCard } from '@/crd/components/space/settings/SpaceSettingsCard';
import { SpaceSettingsSaveBar } from '@/crd/components/space/settings/SpaceSettingsSaveBar';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Switch } from '@/crd/primitives/switch';
import { AddPhaseDialog } from './AddPhaseDialog';
import { LayoutCalloutRowPreview } from './LayoutCalloutRow';
import { LayoutPoolColumn } from './LayoutPoolColumn';
import type {
  ColumnMenuActions,
  LayoutCallout,
  LayoutColumnId,
  LayoutPoolColumn as LayoutPoolColumnData,
  LayoutPostDescriptionDisplay,
  LayoutReorderTarget,
  LayoutSaveBarState,
} from './SpaceSettingsLayoutView.types';

export type SpaceSettingsLayoutViewProps = {
  /**
   * Space hierarchy level. Drives both phase-add visibility and column-DnD:
   * - L0: phase add/delete + column reorder hidden — the home flow is fixed.
   * - L1/L2: admins can add/remove phases and drag columns to reorder them.
   */
  level: 'L0' | 'L1' | 'L2';
  columns: LayoutPoolColumnData[];
  postDescriptionDisplay: LayoutPostDescriptionDisplay;
  saveBar: LayoutSaveBarState;
  onReorder: (calloutId: string, target: LayoutReorderTarget) => void;
  /** Column-level reorder — called with the new order of column IDs. Only invoked at L1/L2. */
  onReorderColumns?: (orderedColumnIds: LayoutColumnId[]) => void;
  onRenameColumn: (columnId: LayoutColumnId, patch: { title?: string; description?: string }) => void;
  onMoveToColumn: (calloutId: string, target: LayoutColumnId) => void;
  onViewPost: (calloutId: string) => void;
  onPostDescriptionDisplayChange: (next: LayoutPostDescriptionDisplay) => void;
  onSave: () => void;
  onDiscardChanges: () => void;
  columnMenuActions: ColumnMenuActions;
  /** Phase add — only invoked when `level !== 'L0'` and `columns.length < maximumNumberOfStates`. */
  onCreatePhase?: (input: { displayName: string; description: string }) => Promise<void>;
  /** Maximum allowed states from innovation-flow settings. Caps the Add Phase button. */
  maximumNumberOfStates?: number;
  /** True while a structural mutation is in flight — disables Add Phase. */
  isStructureMutating?: boolean;
  /**
   * Admin slot rendered in the page header (next to "Add Phase") — used to
   * inject the "Replace innovation flow" button connector at L1/L2. Consumers
   * MUST omit this on L0 (the home flow is fixed and not template-replaceable).
   */
  headerActionsSlot?: ReactNode;
  /**
   * When true, dims the columns area and overlays a "Loading new flow…" spinner
   * — used while the Replace-innovation-flow mutation + refetch are in flight.
   * The page header (buttons) stays visible so the user still has context.
   */
  isReplacingFlow?: boolean;
  className?: string;
};

/**
 * Layout tab — dynamic column count driven by `innovationFlow.states`.
 *
 * Scope:
 *  - Renders one column card per backend state (dynamic order).
 *  - Drag-and-drop reorder + cross-column move (dnd-kit with keyboard sensor).
 *  - Inline-edit column title + description with hover-reveal pencil.
 *  - Three-dot per-column menu: Active phase + Default post template.
 *  - Per-callout kebab (two entries: Move to + View Post).
 *  - Post description display toggle at the top (collapsed / expanded).
 *  - Save Changes / Discard Changes action bar at the bottom-right.
 */
export function SpaceSettingsLayoutView({
  level,
  columns,
  postDescriptionDisplay,
  saveBar,
  onReorder,
  onReorderColumns,
  onRenameColumn,
  onMoveToColumn,
  onViewPost,
  onPostDescriptionDisplayChange,
  onSave,
  onDiscardChanges,
  columnMenuActions,
  onCreatePhase,
  maximumNumberOfStates = Number.POSITIVE_INFINITY,
  isStructureMutating = false,
  headerActionsSlot,
  isReplacingFlow = false,
  className,
}: SpaceSettingsLayoutViewProps) {
  const { t } = useTranslation('crd-spaceSettings');
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const [activeCallout, setActiveCallout] = useState<LayoutCallout | null>(null);
  const [addPhaseOpen, setAddPhaseOpen] = useState(false);
  const canManagePhases = level !== 'L0' && !!onCreatePhase;
  // `isReplacingFlow` also locks structural actions: starting a create-state
  // mutation while the replace-flow mutation + refetch are in flight would race
  // two structural changes against the same innovation flow, and the reseed
  // would land on whichever refetch wins.
  const canAddPhase =
    canManagePhases && columns.length < maximumNumberOfStates && !isStructureMutating && !isReplacingFlow;
  const canReorderColumns = level !== 'L0' && !!onReorderColumns;
  // Sortable column items are prefixed so they don't collide with the per-column
  // droppable zones (those keep `column.id` as their droppable id — see
  // LayoutPoolColumn — so the existing callout cross-column move handler keeps
  // resolving columns by their unprefixed id).
  const sortableColumnIds = columns.map(c => `col:${c.id}`);

  const findColumnIdForCallout = (calloutId: string): LayoutColumnId | null => {
    for (const col of columns) {
      if (col.callouts.some(c => c.id === calloutId)) return col.id;
    }
    return null;
  };

  const resolveTargetColumn = (overId: string): LayoutPoolColumnData | null => {
    return columns.find(c => c.id === overId) ?? columns.find(c => c.callouts.some(cb => cb.id === overId)) ?? null;
  };

  const resolveTargetIndex = (targetCol: LayoutPoolColumnData, overId: string): number => {
    const idx = targetCol.callouts.findIndex(cb => cb.id === overId);
    return idx === -1 ? targetCol.callouts.length : idx;
  };

  const isColumnDrag = (event: DragStartEvent | DragOverEvent | DragEndEvent): boolean =>
    event.active.data.current?.type === 'column';

  const handleDragStart = (event: DragStartEvent) => {
    if (isColumnDrag(event)) return; // No DragOverlay for columns — useSortable transform is enough.
    const id = String(event.active.id);
    for (const col of columns) {
      const found = col.callouts.find(c => c.id === id);
      if (found) {
        setActiveCallout(found);
        return;
      }
    }
  };

  // Cross-column only: when the active callout hovers over a different column,
  // move it into that column in local state so the target column's siblings
  // shift aside (creating the gap/drop indicator the user sees while dragging).
  // Within-column reorder is handled natively by SortableContext's shuffle.
  // Column-vs-column hover is also handled by SortableContext (rectSortingStrategy),
  // so we skip our cross-column callout logic for column drags.
  const handleDragOver = (event: DragOverEvent) => {
    if (isColumnDrag(event)) return;
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const sourceColId = findColumnIdForCallout(activeId);
    const targetCol = resolveTargetColumn(overId);
    if (!sourceColId || !targetCol) return;
    if (sourceColId === targetCol.id) return;

    onReorder(activeId, { columnId: targetCol.id, index: resolveTargetIndex(targetCol, overId) });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCallout(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    if (isColumnDrag(event)) {
      // active.id / over.id are the prefixed sortable ids (`col:${columnId}`).
      // Strip the prefix to get the underlying column ids the consumer expects.
      const stripPrefix = (id: string) => (id.startsWith('col:') ? id.slice(4) : id);
      const activeColId = stripPrefix(String(active.id));
      const overColId = stripPrefix(String(over.id));
      const fromIndex = columns.findIndex(c => c.id === activeColId);
      const toIndex = columns.findIndex(c => c.id === overColId);
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
      const next = columns.map(c => c.id);
      next.splice(toIndex, 0, next.splice(fromIndex, 1)[0]);
      onReorderColumns?.(next);
      return;
    }

    const calloutId = String(active.id);
    const overId = String(over.id);
    const targetCol = resolveTargetColumn(overId);
    if (!targetCol) return;
    onReorder(calloutId, { columnId: targetCol.id, index: resolveTargetIndex(targetCol, overId) });
  };

  const handleDragCancel = () => {
    setActiveCallout(null);
  };

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-page-title">{t('layout.pageHeader.title')}</h2>
          <p className="text-body text-muted-foreground mt-1">{t('layout.pageHeader.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {headerActionsSlot}
          {canManagePhases && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 shrink-0"
              disabled={!canAddPhase}
              onClick={() => setAddPhaseOpen(true)}
            >
              <Plus aria-hidden="true" className="size-4" />
              {t('layout.addPhase.button')}
            </Button>
          )}
        </div>
      </div>

      {/* Columns + Save bar inside a bordered container */}
      <div className="rounded-xl border p-4 relative">
        {isReplacingFlow && (
          <output
            aria-live="polite"
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-background/80 backdrop-blur-sm text-muted-foreground"
          >
            <Loader2 aria-hidden="true" className="size-8 animate-spin" />
            <p className="text-body-emphasis">{t('layout.replaceFlow.loading')}</p>
          </output>
        )}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext items={sortableColumnIds} strategy={rectSortingStrategy}>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 items-start">
              {columns.map(column => {
                const otherColumns = columns.filter(c => c.id !== column.id).map(c => ({ id: c.id, title: c.title }));
                return (
                  <LayoutPoolColumn
                    key={column.id}
                    column={column}
                    otherColumns={otherColumns}
                    showDescription={postDescriptionDisplay === 'expanded'}
                    onRenameColumn={onRenameColumn}
                    onMoveToColumn={onMoveToColumn}
                    onViewPost={onViewPost}
                    columnMenuActions={columnMenuActions}
                    draggable={canReorderColumns}
                  />
                );
              })}
            </div>
          </SortableContext>
          <DragOverlay dropAnimation={null}>
            {activeCallout ? (
              <LayoutCalloutRowPreview
                callout={activeCallout}
                showDescription={postDescriptionDisplay === 'expanded'}
              />
            ) : null}
          </DragOverlay>
        </DndContext>

        <SpaceSettingsSaveBar
          // Lock both Save and Reset while a structural mutation (phase
          // create/delete) or a flow replacement is in flight: the snapshot is
          // being reseeded and a Save click in that window would race against
          // the refetch.
          state={isStructureMutating || isReplacingFlow ? { kind: 'saving' } : saveBar}
          onSave={onSave}
          onDiscard={onDiscardChanges}
          saveLabel={t('saveBar.save')}
          discardLabel={t('saveBar.discard')}
          savingLabel={t('saveBar.saving')}
        />
      </div>

      {/* Post description display toggle — below columns, saves immediately (not buffered) */}
      <SpaceSettingsCard title={t('layout.postDescriptionDisplay.title')}>
        <div className="flex items-start gap-3">
          <Switch
            checked={postDescriptionDisplay === 'collapsed'}
            onCheckedChange={checked => onPostDescriptionDisplayChange(checked ? 'collapsed' : 'expanded')}
            aria-label={t('layout.postDescriptionDisplay.switchLabel')}
          />
          <p className="text-body text-muted-foreground">{t('layout.postDescriptionDisplay.description')}</p>
        </div>
      </SpaceSettingsCard>

      {canManagePhases && onCreatePhase && (
        <AddPhaseDialog
          open={addPhaseOpen}
          onOpenChange={setAddPhaseOpen}
          onSubmit={onCreatePhase}
          existingPhaseNames={columns.map(c => c.title)}
        />
      )}
    </div>
  );
}
