import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';
import { SpaceSettingsCard } from '@/crd/components/space/settings/SpaceSettingsCard';
import { SpaceSettingsSaveBar } from '@/crd/components/space/settings/SpaceSettingsSaveBar';
import { cn } from '@/crd/lib/utils';
import { Switch } from '@/crd/primitives/switch';
import { LayoutPoolColumn } from './LayoutPoolColumn';
import type {
  ColumnMenuActions,
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
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const calloutId = String(active.id);
    // `over.id` is the column id when dropping on an empty area of a column,
    // or a callout id when hovering over an existing row. Normalize to a column.
    const overId = String(over.id);
    const targetCol = columns.find(c => c.id === overId) ?? columns.find(c => c.callouts.some(cb => cb.id === overId));
    if (!targetCol) return;
    const targetIdx =
      targetCol.callouts.findIndex(cb => cb.id === overId) === -1
        ? targetCol.callouts.length
        : targetCol.callouts.findIndex(cb => cb.id === overId);
    onReorder(calloutId, { columnId: targetCol.id, index: targetIdx });
  };

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Page header */}
      <div>
        <h2 className="text-lg font-semibold">{t('layout.pageHeader.title', { defaultValue: 'Layout' })}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t('layout.pageHeader.subtitle', {
            defaultValue: "Customize your Space's navigation tabs. Rename, reorder, and manage post assignments.",
          })}
        </p>
      </div>

      {/* Columns + Save bar inside a bordered container */}
      <div className="rounded-xl border p-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="flex items-start gap-4 overflow-x-auto pb-2">
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
        </DndContext>

        <SpaceSettingsSaveBar
          state={saveBar}
          onSave={onSave}
          onDiscard={onDiscardChanges}
          saveLabel={t('saveBar.save', { defaultValue: 'Save Changes' })}
          discardLabel={t('saveBar.discard', { defaultValue: 'Discard Changes' })}
          savingLabel={t('saveBar.saving', { defaultValue: 'Saving…' })}
        />
      </div>

      {/* Post description display toggle — below columns, saves immediately (not buffered) */}
      <SpaceSettingsCard title={t('layout.postDescriptionDisplay.title', { defaultValue: 'Post description display' })}>
        <div className="flex items-start gap-3">
          <Switch
            checked={postDescriptionDisplay === 'collapsed'}
            onCheckedChange={checked => onPostDescriptionDisplayChange(checked ? 'collapsed' : 'expanded')}
            aria-label={t('layout.postDescriptionDisplay.switchLabel', {
              defaultValue: 'Collapse post descriptions by default',
            })}
          />
          <p className="text-sm text-muted-foreground">
            {t('layout.postDescriptionDisplay.description', {
              defaultValue:
                'Collapse post descriptions by default. When enabled, descriptions show a "Read more" link instead of the full text.',
            })}
          </p>
        </div>
      </SpaceSettingsCard>
    </div>
  );
}
