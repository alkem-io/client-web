import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpToLine,
  Bookmark,
  Eye,
  EyeOff,
  GripVertical,
  MoreHorizontal,
  Pencil,
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
  onEdit?: () => void;
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
  onEdit,
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
            Edit
          </DropdownMenuItem>
        )}

        {editable && isDraft && onPublish && (
          <DropdownMenuItem onClick={onPublish}>
            <Eye className="w-4 h-4 mr-2" aria-hidden="true" />
            Publish
          </DropdownMenuItem>
        )}

        {editable && !isDraft && onUnpublish && (
          <DropdownMenuItem onClick={onUnpublish}>
            <EyeOff className="w-4 h-4 mr-2" aria-hidden="true" />
            Unpublish
          </DropdownMenuItem>
        )}

        {onShare && (
          <DropdownMenuItem onClick={onShare}>
            <Share2 className="w-4 h-4 mr-2" aria-hidden="true" />
            Share
          </DropdownMenuItem>
        )}

        {editable && onSortContributions && (
          <DropdownMenuItem onClick={onSortContributions}>
            <GripVertical className="w-4 h-4 mr-2" aria-hidden="true" />
            Sort Contributions
          </DropdownMenuItem>
        )}

        {canSaveAsTemplate && onSaveAsTemplate && (
          <DropdownMenuItem onClick={onSaveAsTemplate}>
            <Bookmark className="w-4 h-4 mr-2" aria-hidden="true" />
            Save as Template
          </DropdownMenuItem>
        )}

        {movable && (
          <>
            <DropdownMenuSeparator />
            {onMoveTop && (
              <DropdownMenuItem onClick={onMoveTop}>
                <ArrowUpToLine className="w-4 h-4 mr-2" aria-hidden="true" />
                Move to Top
              </DropdownMenuItem>
            )}
            {onMoveUp && (
              <DropdownMenuItem onClick={onMoveUp}>
                <ArrowUp className="w-4 h-4 mr-2" aria-hidden="true" />
                Move Up
              </DropdownMenuItem>
            )}
            {onMoveDown && (
              <DropdownMenuItem onClick={onMoveDown}>
                <ArrowDown className="w-4 h-4 mr-2" aria-hidden="true" />
                Move Down
              </DropdownMenuItem>
            )}
            {onMoveBottom && (
              <DropdownMenuItem onClick={onMoveBottom}>
                <ArrowDownToLine className="w-4 h-4 mr-2" aria-hidden="true" />
                Move to Bottom
              </DropdownMenuItem>
            )}
          </>
        )}

        {editable && onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
