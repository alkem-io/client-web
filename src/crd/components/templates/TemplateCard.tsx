import {
  BookText,
  Copy,
  Eye,
  FileText,
  LayoutTemplate,
  Loader2,
  MoreHorizontal,
  Pencil,
  PenTool,
  Trash2,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { InlineMarkdown } from '@/crd/components/common/InlineMarkdown';
import { backgroundGradient } from '@/crd/lib/backgroundGradient';
import { cn } from '@/crd/lib/utils';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';
import type { TemplateAction, TemplateCardData, TemplateType } from './types';

const TYPE_ICON: Record<TemplateType, React.ElementType> = {
  space: LayoutTemplate,
  callout: Users,
  whiteboard: PenTool,
  post: FileText,
  communityGuidelines: BookText,
};

export type TemplateCardProps = {
  template: TemplateCardData;
  /** Derived from the holder's `can*` predicates for this template's type. */
  canEdit?: boolean;
  canDelete?: boolean;
  /** Shows a "Deleting…" overlay / hides the row optimistically. */
  deleting?: boolean;
  /** Shows a "Creating…" spinner (the card produced by a duplicate). */
  duplicating?: boolean;
  /** Body click → preview. Always available. */
  onPreview: (id: string) => void;
  /** Kebab actions. `preview` is always offered; the rest only when the matching flag is true. */
  onAction: (id: string, action: TemplateAction) => void;
  className?: string;
};

export function TemplateCard({
  template,
  canEdit,
  canDelete,
  deleting,
  duplicating,
  onPreview,
  onAction,
  className,
}: TemplateCardProps) {
  const { t } = useTranslation('crd-templates');
  const TypeIcon = TYPE_ICON[template.type];
  const hasKebabExtras = canEdit || canDelete;

  return (
    <div
      className={cn(
        'group relative flex h-full flex-col border rounded-lg overflow-hidden bg-card transition-all duration-200 hover:shadow-md',
        deleting && 'opacity-50 pointer-events-none',
        className
      )}
    >
      <button
        type="button"
        onClick={() => onPreview(template.id)}
        className="relative aspect-video w-full overflow-hidden text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`${t('card.preview')}: ${template.name}`}
      >
        {template.bannerUrl ? (
          <img
            src={template.bannerUrl}
            alt=""
            className="size-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="size-full flex items-center justify-center" style={backgroundGradient(template.color)}>
            <TypeIcon aria-hidden="true" className="size-10 text-white/70" />
          </div>
        )}
        {duplicating && (
          <span className="absolute inset-0 flex items-center justify-center gap-2 bg-background/70 text-caption text-muted-foreground">
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            {t('manager.duplicating')}
          </span>
        )}
        {deleting && (
          <span className="absolute inset-0 flex items-center justify-center gap-2 bg-background/70 text-caption text-muted-foreground">
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            {t('manager.deleting')}
          </span>
        )}
      </button>

      <div className="flex-1 p-4 flex flex-col gap-3">
        <div className="min-w-0">
          <h4 className="text-card-title leading-none mb-1.5 truncate">{template.name}</h4>
          {template.description && (
            <InlineMarkdown content={template.description} clampLines={2} className="text-body text-muted-foreground" />
          )}
          {template.ownerLabel && (
            <p className="text-caption text-muted-foreground mt-1 truncate">{template.ownerLabel}</p>
          )}
        </div>

        {template.tags.length > 0 && (
          <ul className="flex flex-wrap gap-1">
            {template.tags.slice(0, 4).map(tag => (
              <li key={tag}>
                <Badge variant="secondary" className="text-badge">
                  {tag}
                </Badge>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-center justify-end pt-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild={true}>
              <Button variant="ghost" size="icon" className="size-8" aria-label={t('card.actions')}>
                <MoreHorizontal aria-hidden="true" className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onAction(template.id, 'preview')}>
                <Eye aria-hidden="true" className="size-4 mr-2" />
                {t('card.preview')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction(template.id, 'duplicate')}>
                <Copy aria-hidden="true" className="size-4 mr-2" />
                {t('card.duplicate')}
              </DropdownMenuItem>
              {hasKebabExtras && <DropdownMenuSeparator />}
              {canEdit && (
                <DropdownMenuItem onClick={() => onAction(template.id, 'edit')}>
                  <Pencil aria-hidden="true" className="size-4 mr-2" />
                  {t('card.edit')}
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onAction(template.id, 'delete')}
                >
                  <Trash2 aria-hidden="true" className="size-4 mr-2" />
                  {t('card.delete')}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

export { TYPE_ICON };
