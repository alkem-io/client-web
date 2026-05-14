import { ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

type LinkItem = {
  id: string;
  url: string;
  displayName: string;
  description?: string;
  canEdit?: boolean;
  canDelete?: boolean;
};

type ContributionLinkListProps = {
  links: LinkItem[];
  canAdd?: boolean;
  onAdd?: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
};

export function ContributionLinkList({ links, canAdd, onAdd, onEdit, onDelete, className }: ContributionLinkListProps) {
  const { t } = useTranslation('crd-space');

  return (
    <div className={cn('space-y-2', className)}>
      {links.map(link => {
        const showEdit = link.canEdit && onEdit;
        const showDelete = link.canDelete && onDelete;
        return (
          <div
            key={link.id}
            className="flex items-center gap-2 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 flex-1 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              <ExternalLink className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-body-emphasis text-foreground truncate">{link.displayName}</p>
                {link.description && <p className="text-caption text-muted-foreground truncate">{link.description}</p>}
              </div>
            </a>
            {(showEdit || showDelete) && (
              <div className="flex items-center gap-1 shrink-0">
                {showEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => onEdit?.(link.id)}
                    aria-label={t('callout.linkEditAriaLabel')}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Button>
                )}
                {showDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete?.(link.id)}
                    aria-label={t('callout.linkDeleteAriaLabel')}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                )}
              </div>
            )}
          </div>
        );
      })}
      {canAdd && (
        <Button variant="outline" size="sm" className="gap-2 w-full" onClick={onAdd}>
          <Plus className="w-4 h-4" aria-hidden="true" />
          {t('callout.addLink')}
        </Button>
      )}
    </div>
  );
}
