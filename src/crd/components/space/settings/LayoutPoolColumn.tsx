import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import {
  Check,
  Eye,
  EyeOff,
  FileText,
  GripVertical,
  MoreVertical,
  Pencil,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EmojiInsertButton } from '@/crd/components/common/EmojiInsertButton';
import { InlineMarkdown } from '@/crd/components/common/InlineMarkdown';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { useDialogCloseGuard } from '@/crd/components/dialogs/useDialogCloseGuard';
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
import { PhaseLayoutDialog } from './PhaseLayoutDialog';
import { PhasePostTemplateDialog } from './PhasePostTemplateDialog';
import type {
  ColumnMenuActions,
  LayoutCallout,
  LayoutColumnId,
  LayoutPoolColumn as LayoutPoolColumnData,
  PhaseLayoutInput,
} from './SpaceSettingsLayoutView.types';

// Full literal i18n keys for the per-column Delete affordance, one set per user-facing noun.
// Declared as constants (rather than template-built strings) so the typed `t()` accepts them.
const DELETE_PHASE_KEYS = {
  menuLabel: 'layout.column.deletePhase.menuLabel',
  title: 'layout.column.deletePhase.confirm.title',
  description: 'layout.column.deletePhase.confirm.description',
  confirm: 'layout.column.deletePhase.confirm.confirm',
  cancel: 'layout.column.deletePhase.confirm.cancel',
} as const;
const DELETE_TAB_KEYS = {
  menuLabel: 'layout.column.deleteTab.menuLabel',
  title: 'layout.column.deleteTab.confirm.title',
  description: 'layout.column.deleteTab.confirm.description',
  confirm: 'layout.column.deleteTab.confirm.confirm',
  cancel: 'layout.column.deleteTab.confirm.cancel',
} as const;
type DeleteKeySet = typeof DELETE_PHASE_KEYS | typeof DELETE_TAB_KEYS;

type LayoutPoolColumnProps = {
  column: LayoutPoolColumnData;
  otherColumns: ReadonlyArray<Pick<LayoutPoolColumnData, 'id' | 'title'>>;
  showDescription: boolean;
  onMoveToColumn: (calloutId: string, target: LayoutColumnId) => void;
  onViewPost: (calloutId: string) => void;
  columnMenuActions: ColumnMenuActions;
  /** User-facing noun for this column: 'tab' on L0, 'phase' on subspaces. Drives Delete wording. */
  entityNoun?: 'tab' | 'phase';
  /** Enables the column drag handle + sortable behaviour (off at L0). */
  draggable?: boolean;
  /** Whether the Layout dialog shows the sidebar-widgets section (hidden on subspaces for now). */
  sidebarSettingsEnabled?: boolean;
  className?: string;
} & MarkdownUploadProps;

export function LayoutPoolColumn({
  column,
  otherColumns,
  showDescription,
  onMoveToColumn,
  onViewPost,
  columnMenuActions,
  entityNoun = 'phase',
  draggable = false,
  sidebarSettingsEnabled = true,
  className,
  onImageUpload,
  iframeAllowedUrls,
  onError,
}: LayoutPoolColumnProps) {
  const { t } = useTranslation('crd-spaceSettings');
  // Full literal i18n keys per entity noun — kept as a const map (not a template-built string) so
  // the typed `t()` accepts them. 'tab' → deleteTab.* (L0), 'phase' → deletePhase.* (subspaces).
  const deleteKeys = entityNoun === 'tab' ? DELETE_TAB_KEYS : DELETE_PHASE_KEYS;
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
  const [layoutDialogOpen, setLayoutDialogOpen] = useState(false);
  const [postTemplateDialogOpen, setPostTemplateDialogOpen] = useState(false);
  const [pendingPhaseDelete, setPendingPhaseDelete] = useState(false);
  // Hiding removes the phase from the member-facing menu, so it is confirmed; showing
  // again is non-destructive and applies directly (no dialog).
  const [pendingPhaseHide, setPendingPhaseHide] = useState(false);

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
            <span title={column.title} className="min-w-0 flex-1 truncate text-card-title">
              {column.title}
            </span>
            <ColumnOverflowMenu
              column={column}
              actions={columnMenuActions}
              deleteKeys={deleteKeys}
              onEditDetails={() => setEditDetailsOpen(true)}
              onRequestLayout={() => setLayoutDialogOpen(true)}
              onRequestPostTemplate={() => setPostTemplateDialogOpen(true)}
              onRequestDeletePhase={() => setPendingPhaseDelete(true)}
              onRequestHidePhase={() => setPendingPhaseHide(true)}
              t={t}
            />
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {column.isCurrentPhase && (
              <Badge variant="default">
                <Check aria-hidden="true" />
                {t('layout.column.activePhase.badge')}
              </Badge>
            )}
            {column.isHidden && (
              <Badge variant="secondary">
                <EyeOff aria-hidden="true" />
                {t('layout.column.hideShow.hiddenBadge')}
              </Badge>
            )}
          </div>
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
        key={`edit:${column.id}:${String(editDetailsOpen)}`}
        open={editDetailsOpen}
        title={column.title}
        description={column.description}
        otherTitles={otherColumns.map(c => c.title)}
        onSave={async (title, description) => {
          await columnMenuActions.onSaveColumnDetails(column.id, title, description);
          setEditDetailsOpen(false);
        }}
        onCancel={() => setEditDetailsOpen(false)}
        onImageUpload={onImageUpload}
        iframeAllowedUrls={iframeAllowedUrls}
        onError={onError}
      />

      <PhaseLayoutDialog
        key={`layout:${column.id}:${String(layoutDialogOpen)}`}
        open={layoutDialogOpen}
        onOpenChange={setLayoutDialogOpen}
        phaseName={column.title}
        sidebarSettingsEnabled={sidebarSettingsEnabled}
        values={column.layout ?? { descriptionCollapsed: false, showPublishDetails: true, sidebar: [] }}
        onSave={async (layout: PhaseLayoutInput) => {
          // Await persistence and let the dialog close itself on success — a failed save
          // keeps it open (see PhaseLayoutDialog.handleSave). Rejection propagates so the
          // dialog can react; Apollo's error layer surfaces the toast.
          await columnMenuActions.onSaveLayout(column.id, layout);
        }}
      />

      <PhasePostTemplateDialog
        open={postTemplateDialogOpen}
        onOpenChange={setPostTemplateDialogOpen}
        phaseName={column.title}
        currentTemplate={column.defaultCalloutTemplate}
        onChooseTemplate={() => columnMenuActions.onOpenDefaultCalloutTemplatePicker(column.id)}
        onClearTemplate={() => columnMenuActions.onSetAsDefaultCalloutTemplate(column.id, null)}
      />

      <ConfirmationDialog
        open={pendingPhaseDelete}
        onOpenChange={open => {
          if (!open) setPendingPhaseDelete(false);
        }}
        variant="destructive"
        title={t(deleteKeys.title)}
        description={t(deleteKeys.description)}
        confirmLabel={t(deleteKeys.confirm)}
        cancelLabel={t(deleteKeys.cancel)}
        onConfirm={() => {
          void columnMenuActions.onDeletePhase?.(column.id);
          setPendingPhaseDelete(false);
        }}
        onCancel={() => setPendingPhaseDelete(false)}
      />

      {/* Hide confirmation — explains that hiding is UI-only and content stays reachable by URL.
          Not `variant="destructive"`: hiding removes nothing and is fully reversible via Show. */}
      <ConfirmationDialog
        open={pendingPhaseHide}
        onOpenChange={open => {
          if (!open) setPendingPhaseHide(false);
        }}
        title={t('layout.column.hideShow.confirm.title')}
        description={t('layout.column.hideShow.confirm.description')}
        confirmLabel={t('layout.column.hideShow.confirm.confirm')}
        cancelLabel={t('layout.column.hideShow.confirm.cancel')}
        onConfirm={() => {
          void columnMenuActions.onToggleVisibility?.(column.id, true);
          setPendingPhaseHide(false);
        }}
        onCancel={() => setPendingPhaseHide(false)}
      />
    </>
  );
}

/* ──────────────── Column overflow menu ──────────────── */

type ColumnOverflowMenuProps = {
  column: LayoutPoolColumnData;
  actions: ColumnMenuActions;
  /** Literal i18n keys for the Delete entry — the tab set (L0) or the phase set (subspaces). */
  deleteKeys: DeleteKeySet;
  onEditDetails: () => void;
  onRequestLayout: () => void;
  onRequestPostTemplate: () => void;
  onRequestDeletePhase: () => void;
  onRequestHidePhase: () => void;
  t: ReturnType<typeof useTranslation<'crd-spaceSettings'>>['t'];
};

function ColumnOverflowMenu({
  column,
  actions,
  deleteKeys,
  onEditDetails,
  onRequestLayout,
  onRequestPostTemplate,
  onRequestDeletePhase,
  onRequestHidePhase,
  t,
}: ColumnOverflowMenuProps) {
  // Visibility capability is gated on the consumer providing `onToggleVisibility`
  // AND the column carrying a known visibility (server exposes the `visible` flag).
  const canToggleVisibility = !!actions.onToggleVisibility && typeof column.isHidden === 'boolean';
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild={true}>
        <Button type="button" variant="ghost" size="icon" aria-label={t('layout.column.menu')} className="shrink-0">
          <MoreVertical aria-hidden="true" className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* FR-010 menu order: Mark as active / Title and Description / Layout / Post Template / Hide/Show / Delete */}
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
        <DropdownMenuItem onClick={onRequestLayout}>
          <SlidersHorizontal aria-hidden="true" className="mr-2 size-3.5" />
          {t('layout.column.phaseLayout.menuLabel')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onRequestPostTemplate}>
          <FileText aria-hidden="true" className="mr-2 size-3.5" />
          {t('layout.column.postTemplate.menuLabel')}
        </DropdownMenuItem>
        {canToggleVisibility && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                // Show is non-destructive → apply directly. Hide → confirm first.
                if (column.isHidden) {
                  void actions.onToggleVisibility?.(column.id, false);
                } else {
                  onRequestHidePhase();
                }
              }}
            >
              {column.isHidden ? (
                <Eye aria-hidden="true" className="mr-2 size-3.5" />
              ) : (
                <EyeOff aria-hidden="true" className="mr-2 size-3.5" />
              )}
              {column.isHidden ? t('layout.column.hideShow.showMenuLabel') : t('layout.column.hideShow.hideMenuLabel')}
            </DropdownMenuItem>
          </>
        )}
        {actions.onDeletePhase && column.isDeletable !== false && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onRequestDeletePhase}>
              <Trash2 aria-hidden="true" className="mr-2 size-3.5" />
              {t(deleteKeys.menuLabel)}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ──────────────── Edit Details dialog ──────────────── */

// A title made up entirely of emoji (including flags, skin-tone modifiers, keycaps, and ZWJ
// sequences like family emoji) is exempt from the 3-character minimum — JS string length counts
// UTF-16 code units, so even a single simple emoji (e.g. "🎉") measures 2, not 1.
// \p{Emoji_Component} is required for flags (regional indicators), skin tones, keycaps, VS-16 and
// ZWJ, but it also matches plain 0-9/#/* — the lookahead demands at least one genuinely emoji
// character so digit-only titles like "1" don't slip past the minimum.
const EMOJI_ONLY_TITLE =
  /^(?=.*(?:[\p{Extended_Pictographic}\p{Regional_Indicator}]|\uFE0F))[\p{Extended_Pictographic}\p{Emoji_Component}]+$/u;

/** The Edit Details title rule: min 3 characters after trimming, unless the title is emoji-only. */
export function isColumnTitleTooShort(title: string): boolean {
  const trimmed = title.trim();
  const emojiOnly = trimmed.length > 0 && EMOJI_ONLY_TITLE.test(trimmed);
  return !emojiOnly && trimmed.length < 3;
}

type EditDetailsDialogProps = {
  open: boolean;
  title: string;
  description: string;
  /** Titles of every OTHER column — a rename to any of these (case-insensitive) is rejected. */
  otherTitles: string[];
  onSave: (title: string, description: string) => void | Promise<void>;
  onCancel: () => void;
} & MarkdownUploadProps;

function EditDetailsDialog({
  open,
  title: initialTitle,
  description: initialDescription,
  otherTitles,
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

  const trimmedTitle = title.trim();
  const titleTooShort = isColumnTitleTooShort(title);
  // Phase display names must be unique — the feed joins posts to their phase by NAME, so two
  // phases sharing a name break the join (ambiguous settings, duplicated posts, rename cascade
  // dragging the other phase's posts). Mirrors AddPhaseDialog's guard for the rename path.
  const titleDuplicate =
    trimmedTitle.length > 0 && otherTitles.some(n => n.toLowerCase() === trimmedTitle.toLowerCase());
  const titleInvalid = titleTooShort || titleDuplicate;

  const isDirty = title !== initialTitle || description !== initialDescription;
  const { handleOpenChange, requestClose, guardElement } = useDialogCloseGuard({
    isDirty,
    onClose: onCancel,
    blockClose: saving,
  });

  const handleSave = async () => {
    if (titleInvalid) return;
    setSaving(true);
    try {
      await onSave(title.trim(), description);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Pencil aria-hidden="true" className="size-4" />
              {t('layout.column.editDetails.dialogTitle')}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto">
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
                  aria-invalid={titleInvalid}
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
              {titleTooShort && (
                <p className="text-caption text-destructive">{t('layout.column.editDetails.titleTooShort')}</p>
              )}
              {titleDuplicate && !titleTooShort && (
                <p className="text-caption text-destructive">{t('layout.column.editDetails.titleDuplicate')}</p>
              )}
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

          <DialogFooter className="shrink-0">
            <Button type="button" variant="ghost" onClick={requestClose} disabled={saving}>
              {t('layout.column.editDetails.cancel')}
            </Button>
            <Button type="button" onClick={handleSave} disabled={saving || titleInvalid}>
              {saving ? t('layout.column.editDetails.saving') : t('layout.column.editDetails.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {guardElement}
    </>
  );
}
