import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpToLine,
  Bookmark,
  Columns3,
  Eye,
  EyeOff,
  GripVertical,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Share2,
  Trash2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';

type CalloutContextMenuProps = {
  isDraft: boolean;
  editable: boolean;
  movable: boolean;
  canSaveAsTemplate: boolean;
  /** Render the Save-as-Template item greyed out / non-actionable (e.g. document callouts — not yet supported). */
  saveAsTemplateDisabled?: boolean;
  /** Tooltip explaining why Save-as-Template is disabled. */
  saveAsTemplateDisabledReason?: string;
  onEdit?: () => void;
  /** Tasks board only: open the column-management dialog. Gated on edit capability. */
  onManageColumns?: () => void;
  /** Replace the backing file of a Collabora (OfficeDocs) framing document. */
  onReplace?: () => void;
  onPublish?: () => void;
  onUnpublish?: () => void;
  onDelete?: () => void;
  onSortContributions?: () => void;
  onSaveAsTemplate?: () => void;
  onMoveTop?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onMoveBottom?: () => void;
  onShare?: () => void;
  className?: string;
};

export function CalloutContextMenu({
  isDraft,
  editable,
  movable,
  canSaveAsTemplate,
  saveAsTemplateDisabled,
  saveAsTemplateDisabledReason,
  onEdit,
  onManageColumns,
  onReplace,
  onPublish,
  onUnpublish,
  onDelete,
  onSortContributions,
  onSaveAsTemplate,
  onMoveTop,
  onMoveUp,
  onMoveDown,
  onMoveBottom,
  onShare,
}: CalloutContextMenuProps) {
  const { t } = useTranslation('crd-space');
  // The manage-columns label is a task-board string — read it from its own
  // namespace (the column dialog uses the same key) rather than duplicating it
  // under crd-space.
  const { t: tTaskBoard } = useTranslation('crd-taskBoard');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild={true}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label={t('mobile.settings')}
        >
          <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {editable && onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="w-4 h-4 mr-2" aria-hidden="true" />
            {t('contextMenu.edit')}
          </DropdownMenuItem>
        )}

        {editable && onManageColumns && (
          <DropdownMenuItem onClick={onManageColumns}>
            <Columns3 className="w-4 h-4 mr-2" aria-hidden="true" />
            {tTaskBoard('columns.manage')}
          </DropdownMenuItem>
        )}

        {editable && onReplace && (
          <DropdownMenuItem onClick={onReplace}>
            <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
            {t('callout.documentReplace')}
          </DropdownMenuItem>
        )}

        {editable && isDraft && onPublish && (
          <DropdownMenuItem onClick={onPublish}>
            <Eye className="w-4 h-4 mr-2" aria-hidden="true" />
            {t('contextMenu.publish')}
          </DropdownMenuItem>
        )}

        {editable && !isDraft && onUnpublish && (
          <DropdownMenuItem onClick={onUnpublish}>
            <EyeOff className="w-4 h-4 mr-2" aria-hidden="true" />
            {t('contextMenu.unpublish')}
          </DropdownMenuItem>
        )}

        {onShare && (
          <DropdownMenuItem onClick={onShare}>
            <Share2 className="w-4 h-4 mr-2" aria-hidden="true" />
            {t('contextMenu.share')}
          </DropdownMenuItem>
        )}

        {editable && onSortContributions && (
          <DropdownMenuItem onClick={onSortContributions}>
            <GripVertical className="w-4 h-4 mr-2" aria-hidden="true" />
            {t('contextMenu.sortContributions')}
          </DropdownMenuItem>
        )}

        {canSaveAsTemplate && (
          <DropdownMenuItem
            onClick={saveAsTemplateDisabled ? undefined : onSaveAsTemplate}
            disabled={saveAsTemplateDisabled}
            title={saveAsTemplateDisabled ? saveAsTemplateDisabledReason : undefined}
          >
            <Bookmark className="w-4 h-4 mr-2" aria-hidden="true" />
            {t('contextMenu.saveAsTemplate')}
          </DropdownMenuItem>
        )}

        {movable && (
          <>
            <DropdownMenuSeparator />
            {onMoveTop && (
              <DropdownMenuItem onClick={onMoveTop}>
                <ArrowUpToLine className="w-4 h-4 mr-2" aria-hidden="true" />
                {t('contextMenu.moveToTop')}
              </DropdownMenuItem>
            )}
            {onMoveUp && (
              <DropdownMenuItem onClick={onMoveUp}>
                <ArrowUp className="w-4 h-4 mr-2" aria-hidden="true" />
                {t('contextMenu.moveUp')}
              </DropdownMenuItem>
            )}
            {onMoveDown && (
              <DropdownMenuItem onClick={onMoveDown}>
                <ArrowDown className="w-4 h-4 mr-2" aria-hidden="true" />
                {t('contextMenu.moveDown')}
              </DropdownMenuItem>
            )}
            {onMoveBottom && (
              <DropdownMenuItem onClick={onMoveBottom}>
                <ArrowDownToLine className="w-4 h-4 mr-2" aria-hidden="true" />
                {t('contextMenu.moveToBottom')}
              </DropdownMenuItem>
            )}
          </>
        )}

        {editable && onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
              {t('contextMenu.delete')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
