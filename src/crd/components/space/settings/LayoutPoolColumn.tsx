import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Check, MoreVertical, Pencil } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InlineEditText } from '@/crd/components/common/InlineEditText';
import { MarkdownEditor } from '@/crd/forms/markdown/MarkdownEditor';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Card, CardContent } from '@/crd/primitives/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';
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
  className?: string;
};

export function LayoutPoolColumn({
  column,
  otherColumns,
  showDescription,
  onRenameColumn,
  onMoveToColumn,
  onViewPost,
  columnMenuActions,
  className,
}: LayoutPoolColumnProps) {
  const { t } = useTranslation('crd-spaceSettings');
  const calloutIds = column.callouts.map(c => c.id);
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const [editDetailsOpen, setEditDetailsOpen] = useState(false);

  return (
    <>
      <Card
        className={cn(
          'flex min-w-[280px] max-w-[320px] flex-1 flex-col overflow-hidden',
          isOver && 'ring-2 ring-primary/30',
          className
        )}
      >
        <div className="bg-muted/40 px-4 pt-4 pb-3">
          <div className="flex items-center justify-between gap-2">
            <InlineEditText
              value={column.title}
              onChange={next => onRenameColumn(column.id, { title: next })}
              ariaLabel={t('layout.column.titleAriaLabel', { defaultValue: 'Column title' })}
              editAriaLabel={t('layout.column.editTitle', { defaultValue: 'Edit column title' })}
              placeholder={t('layout.column.titlePlaceholder', { defaultValue: 'Column title' })}
              className="min-w-0 flex-1 text-base font-semibold"
            />
            <ColumnOverflowMenu
              column={column}
              actions={columnMenuActions}
              onEditDetails={() => setEditDetailsOpen(true)}
              t={t}
            />
          </div>
          {column.description && (
            <p className="mt-1 line-clamp-3 text-sm text-muted-foreground break-words">{column.description}</p>
          )}
        </div>
        <CardContent ref={setNodeRef} className="flex flex-col gap-2 px-4 py-3">
          <SortableContext items={calloutIds} strategy={verticalListSortingStrategy}>
            {column.callouts.length === 0 && (
              <div className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
                {t('layout.column.empty', { defaultValue: 'No callouts in this column yet.' })}
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
        open={editDetailsOpen}
        title={column.title}
        description={column.description}
        onSave={async (title, description) => {
          await columnMenuActions.onSaveColumnDetails(column.id, title, description);
          setEditDetailsOpen(false);
        }}
        onCancel={() => setEditDetailsOpen(false)}
      />
    </>
  );
}

/* ──────────────── Column overflow menu ──────────────── */

type ColumnOverflowMenuProps = {
  column: LayoutPoolColumnData;
  actions: ColumnMenuActions;
  onEditDetails: () => void;
  t: ReturnType<typeof useTranslation<'crd-spaceSettings'>>['t'];
};

function ColumnOverflowMenu({ column, actions, onEditDetails, t }: ColumnOverflowMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild={true}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t('layout.column.menu', { defaultValue: 'Column actions' })}
          className="shrink-0"
        >
          <MoreVertical aria-hidden="true" className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => actions.onChangeActivePhase(column.id)} disabled={column.isCurrentPhase}>
          {column.isCurrentPhase ? (
            <span className="inline-flex items-center gap-1">
              <Check aria-hidden="true" className="size-3" />
              {t('layout.column.activePhase.current', { defaultValue: 'Active phase (current)' })}
            </span>
          ) : (
            t('layout.column.activePhase.set', { defaultValue: 'Mark as active phase' })
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onEditDetails}>
          <Pencil aria-hidden="true" className="mr-2 size-3.5" />
          {t('layout.column.editDetails.menuLabel', { defaultValue: 'Edit Details' })}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {t('layout.column.defaultPostTemplate.label', { defaultValue: 'Default post template' })}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuLabel>
              {t('layout.column.defaultPostTemplate.header', { defaultValue: 'Pick a template' })}
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => actions.onSetAsDefaultPostTemplate(column.id, null)}>
              {t('layout.column.defaultPostTemplate.clear', { defaultValue: 'Clear default' })}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {actions.availablePostTemplates.length === 0 && (
              <DropdownMenuItem disabled={true}>
                {t('layout.column.defaultPostTemplate.none', { defaultValue: 'No templates available' })}
              </DropdownMenuItem>
            )}
            {actions.availablePostTemplates.map(tpl => (
              <DropdownMenuItem key={tpl.id} onClick={() => actions.onSetAsDefaultPostTemplate(column.id, tpl.id)}>
                {tpl.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
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
};

function EditDetailsDialog({
  open,
  title: initialTitle,
  description: initialDescription,
  onSave,
  onCancel,
}: EditDetailsDialogProps) {
  const { t } = useTranslation('crd-spaceSettings');
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [saving, setSaving] = useState(false);

  // Re-seed when the dialog opens with new values.
  const [prevOpen, setPrevOpen] = useState(false);
  if (open && !prevOpen) {
    setTitle(initialTitle);
    setDescription(initialDescription);
    setSaving(false);
  }
  if (open !== prevOpen) {
    setPrevOpen(open);
  }

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
            {t('layout.column.editDetails.dialogTitle', { defaultValue: 'Edit Details: Flow Phase' })}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">
              {t('layout.column.editDetails.titleLabel', { defaultValue: 'Title' })}
            </span>
            <InlineEditText
              value={title}
              onChange={setTitle}
              ariaLabel={t('layout.column.editDetails.titleLabel', { defaultValue: 'Title' })}
              editAriaLabel={t('layout.column.editDetails.editTitle', { defaultValue: 'Edit title' })}
              placeholder={t('layout.column.titlePlaceholder', { defaultValue: 'Column title' })}
              className="text-lg font-semibold"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">
              {t('layout.column.editDetails.descriptionLabel', { defaultValue: 'Description' })}
            </span>
            <MarkdownEditor
              value={description}
              onChange={setDescription}
              placeholder={t('layout.column.editDetails.descriptionPlaceholder', { defaultValue: 'Description' })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
            {t('layout.column.editDetails.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving
              ? t('layout.column.editDetails.saving', { defaultValue: 'Saving…' })
              : t('layout.column.editDetails.save', { defaultValue: 'Save' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
