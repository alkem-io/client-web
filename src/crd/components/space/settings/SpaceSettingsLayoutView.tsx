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
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SpaceSettingsCard } from '@/crd/components/space/settings/SpaceSettingsCard';
import { SpaceSettingsSaveBar } from '@/crd/components/space/settings/SpaceSettingsSaveBar';
import { cn } from '@/crd/lib/utils';
import { Switch } from '@/crd/primitives/switch';
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
  columns: LayoutPoolColumnData[];
  postDescriptionDisplay: LayoutPostDescriptionDisplay;
  saveBar: LayoutSaveBarState;
  onReorder: (calloutId: string, target: LayoutReorderTarget) => void;
  onRenameColumn: (columnId: LayoutColumnId, patch: { title?: string; description?: string }) => void;
  onMoveToColumn: (calloutId: string, target: LayoutColumnId) => void;
  onViewPost: (calloutId: string) => void;
  onPostDescriptionDisplayChange: (next: LayoutPostDescriptionDisplay) => void;
  onSave: () => void;
  onDiscardChanges: () => void;
  columnMenuActions: ColumnMenuActions;
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
  columns,
  postDescriptionDisplay,
  saveBar,
  onReorder,
  onRenameColumn,
  onMoveToColumn,
  onViewPost,
  onPostDescriptionDisplayChange,
  onSave,
  onDiscardChanges,
  columnMenuActions,
  className,
}: SpaceSettingsLayoutViewProps) {
  const { t } = useTranslation('crd-spaceSettings');
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const [activeCallout, setActiveCallout] = useState<LayoutCallout | null>(null);

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

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    for (const col of columns) {
      const found = col.callouts.find(c => c.id === id);
      if (found) {
        setActiveCallout(found);
        return;
      }
    }
  };

  // Cross-column only: when the active item hovers over a different column,
  // move it into that column in local state so the target column's siblings
  // shift aside (creating the gap/drop indicator the user sees while dragging).
  // Within-column reorder is handled natively by SortableContext's shuffle.
  const handleDragOver = (event: DragOverEvent) => {
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
      <div>
        <h2 className="text-page-title">{t('layout.pageHeader.title')}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t('layout.pageHeader.subtitle')}</p>
      </div>

      {/* Columns + Save bar inside a bordered container */}
      <div className="rounded-xl border p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
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
                />
              );
            })}
          </div>
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
          state={saveBar}
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
          <p className="text-sm text-muted-foreground">{t('layout.postDescriptionDisplay.description')}</p>
        </div>
      </SpaceSettingsCard>
    </div>
  );
}
