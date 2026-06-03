import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Check, GripVertical, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EmojiInsertButton } from '@/crd/components/common/EmojiInsertButton';
import { InlineEditText } from '@/crd/components/common/InlineEditText';
import { InlineMarkdown } from '@/crd/components/common/InlineMarkdown';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { MarkdownEditor, type MarkdownUploadProps } from '@/crd/forms/markdown/MarkdownEditor';
import { cn } from '@/crd/lib/utils';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Card, CardContent } from '@/crd/primitives/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';
import { Input } from '@/crd/primitives/input';
import { LayoutCalloutRow } from './LayoutCalloutRow';
import type {
  ColumnMenuActions,
  LayoutCallout,
  LayoutColumnId,
  LayoutPoolColumn as LayoutPoolColumnData,
} from './SpaceSettingsLayoutView.types';

type LayoutPoolColumnProps = {
  column: LayoutPoolColumnData;
  otherColumns: ReadonlyArray<Pick<LayoutPoolColumnData, 'id' | 'title'>>;
  showDescription: boolean;
  onRenameColumn: (columnId: LayoutColumnId, patch: { title?: string; description?: string }) => void;
  onMoveToColumn: (calloutId: string, target: LayoutColumnId) => void;
  onViewPost: (calloutId: string) => void;
  columnMenuActions: ColumnMenuActions;
  /** Enables the column drag handle + sortable behaviour (off at L0). */
  draggable?: boolean;
  className?: string;
} & MarkdownUploadProps;

export function LayoutPoolColumn({
  column,
  otherColumns,
  showDescription,
  onRenameColumn,
  onMoveToColumn,
  onViewPost,
  columnMenuActions,
  draggable = false,
  className,
  onImageUpload,
  iframeAllowedUrls,
  onError,
}: LayoutPoolColumnProps) {
  const { t } = useTranslation('crd-spaceSettings');
  const calloutIds = column.callouts.map(c => c.id);
  // Drop target for cross-column callout moves — keeps `column.id` as the
  // droppable id so the view's `resolveTargetColumn` continues to work unchanged.
  const { setNodeRef: setCalloutDropRef, isOver } = useDroppable({ id: column.id });
  // Column-level sortable — registers the card under the prefixed sortable id
  // `col:${column.id}` so it doesn't collide with the callout droppable above.
  // Disabled at L0 (`draggable={false}`), in which case it's inert.
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `col:${column.id}`,
    data: { type: 'column' },
    disabled: !draggable,
  });
  const sortableStyle = draggable
    ? {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
      }
    : undefined;
  const [editDetailsOpen, setEditDetailsOpen] = useState(false);
  const [pendingPhaseDelete, setPendingPhaseDelete] = useState(false);

  return (
    <>
      <Card
        ref={draggable ? setSortableRef : undefined}
        style={sortableStyle}
        className={cn(
          'flex min-w-0 flex-1 flex-col overflow-hidden',
          column.isCurrentPhase && 'border-2 border-primary',
          isOver && 'ring-2 ring-primary/30',
          isDragging && 'opacity-50',
          className
        )}
      >
        <div className="bg-muted/40 px-4 pt-4 pb-3">
          <div className="flex items-center justify-between gap-2">
            {draggable && (
              <button
                type="button"
                aria-label={t('layout.column.drag')}
                className="shrink-0 cursor-grab touch-none rounded p-0.5 text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50 active:cursor-grabbing"
                {...attributes}
                {...listeners}
              >
                <GripVertical aria-hidden="true" className="size-4" />
              </button>
            )}
            <InlineEditText
              value={column.title}
              onChange={next => onRenameColumn(column.id, { title: next })}
              ariaLabel={t('layout.column.titleAriaLabel')}
              editAriaLabel={t('layout.column.editTitle')}
              placeholder={t('layout.column.titlePlaceholder')}
              className="min-w-0 flex-1 text-card-title"
            />
            <ColumnOverflowMenu
              column={column}
              actions={columnMenuActions}
              onEditDetails={() => setEditDetailsOpen(true)}
              onRequestDeletePhase={() => setPendingPhaseDelete(true)}
              t={t}
            />
          </div>
          {column.isCurrentPhase && (
            <Badge variant="default" className="mt-1.5">
              <Check aria-hidden="true" />
              {t('layout.column.activePhase.badge')}
            </Badge>
          )}
          {column.description && (
            <InlineMarkdown
              content={column.description}
              clampLines={3}
              className="mt-1 block text-body text-muted-foreground break-words"
            />
          )}
        </div>
        <CardContent ref={setCalloutDropRef} className="flex flex-col gap-2 px-4 py-3">
          <SortableContext items={calloutIds} strategy={verticalListSortingStrategy}>
            {column.callouts.length === 0 && (
              <div className="rounded-md border border-dashed p-4 text-center text-caption text-muted-foreground">
                {t('layout.column.empty')}
              </div>
            )}
            {column.callouts.map((callout: LayoutCallout) => (
              <LayoutCalloutRow
                key={callout.id}
                callout={callout}
                currentColumnId={column.id}
                otherColumns={otherColumns}
                showDescription={showDescription}
                onMoveToColumn={onMoveToColumn}
                onViewPost={onViewPost}
              />
            ))}
          </SortableContext>
        </CardContent>
      </Card>

      <EditDetailsDialog
        key={`${column.id}:${String(editDetailsOpen)}`}
        open={editDetailsOpen}
        title={column.title}
        description={column.description}
        onSave={async (title, description) => {
          await columnMenuActions.onSaveColumnDetails(column.id, title, description);
          setEditDetailsOpen(false);
        }}
        onCancel={() => setEditDetailsOpen(false)}
        onImageUpload={onImageUpload}
        iframeAllowedUrls={iframeAllowedUrls}
        onError={onError}
      />

      <ConfirmationDialog
        open={pendingPhaseDelete}
        onOpenChange={open => {
          if (!open) setPendingPhaseDelete(false);
        }}
        variant="destructive"
        title={t('layout.column.deletePhase.confirm.title')}
        description={t('layout.column.deletePhase.confirm.description')}
        confirmLabel={t('layout.column.deletePhase.confirm.confirm')}
        cancelLabel={t('layout.column.deletePhase.confirm.cancel')}
        onConfirm={() => {
          void columnMenuActions.onDeletePhase?.(column.id);
          setPendingPhaseDelete(false);
        }}
        onCancel={() => setPendingPhaseDelete(false)}
      />
    </>
  );
}

/* ──────────────── Column overflow menu ──────────────── */

type ColumnOverflowMenuProps = {
  column: LayoutPoolColumnData;
  actions: ColumnMenuActions;
  onEditDetails: () => void;
  onRequestDeletePhase: () => void;
  t: ReturnType<typeof useTranslation<'crd-spaceSettings'>>['t'];
};

function ColumnOverflowMenu({ column, actions, onEditDetails, onRequestDeletePhase, t }: ColumnOverflowMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild={true}>
        <Button type="button" variant="ghost" size="icon" aria-label={t('layout.column.menu')} className="shrink-0">
          <MoreVertical aria-hidden="true" className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => actions.onChangeActivePhase(column.id)} disabled={column.isCurrentPhase}>
          {column.isCurrentPhase ? (
            <span className="inline-flex items-center gap-1">
              <Check aria-hidden="true" className="size-3" />
              {t('layout.column.activePhase.current')}
            </span>
          ) : (
            t('layout.column.activePhase.set')
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onEditDetails}>
          <Pencil aria-hidden="true" className="mr-2 size-3.5" />
          {t('layout.column.editDetails.menuLabel')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => actions.onOpenDefaultCalloutTemplatePicker(column.id)}>
          {t('layout.column.defaultCalloutTemplate.set')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => actions.onSetAsDefaultCalloutTemplate(column.id, null)}>
          {t('layout.column.defaultCalloutTemplate.clear')}
        </DropdownMenuItem>
        {actions.onDeletePhase && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onRequestDeletePhase}>
              <Trash2 aria-hidden="true" className="mr-2 size-3.5" />
              {t('layout.column.deletePhase.menuLabel')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ──────────────── Edit Details dialog ──────────────── */

type EditDetailsDialogProps = {
  open: boolean;
  title: string;
  description: string;
  onSave: (title: string, description: string) => void | Promise<void>;
  onCancel: () => void;
} & MarkdownUploadProps;

function EditDetailsDialog({
  open,
  title: initialTitle,
  description: initialDescription,
  onSave,
  onCancel,
  onImageUpload,
  iframeAllowedUrls,
  onError,
}: EditDetailsDialogProps) {
  const { t } = useTranslation('crd-spaceSettings');
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [saving, setSaving] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(title.trim(), description);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={nextOpen => {
        if (!nextOpen) onCancel();
      }}
    >
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil aria-hidden="true" className="size-4" />
            {t('layout.column.editDetails.dialogTitle')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-body-emphasis text-muted-foreground">
              {t('layout.column.editDetails.titleLabel')}
            </span>
            <div className="flex items-center gap-2">
              <Input
                ref={titleInputRef}
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={t('layout.column.titlePlaceholder')}
                aria-label={t('layout.column.editDetails.titleLabel')}
                disabled={saving}
                className="flex-1 text-subsection-title"
              />
              <EmojiInsertButton
                inputRef={titleInputRef}
                value={title}
                onChange={setTitle}
                ariaLabel={t('layout.column.editDetails.insertEmoji')}
                disabled={saving}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-body-emphasis">{t('layout.column.editDetails.descriptionLabel')}</span>
            <MarkdownEditor
              value={description}
              onChange={setDescription}
              placeholder={t('layout.column.editDetails.descriptionPlaceholder')}
              onImageUpload={onImageUpload}
              iframeAllowedUrls={iframeAllowedUrls}
              onError={onError}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
            {t('layout.column.editDetails.cancel')}
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? t('layout.column.editDetails.saving') : t('layout.column.editDetails.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
