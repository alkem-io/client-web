import { ExternalLink, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

type LinkItem = {
  id: string;
  url: string;
  displayName: string;
  description?: string;
};

type ContributionLinkListProps = {
  links: LinkItem[];
  canAdd?: boolean;
  onAdd?: () => void;
  className?: string;
};

export function ContributionLinkList({ links, canAdd, onAdd, className }: ContributionLinkListProps) {
  const { t } = useTranslation('crd-space');

  return (
    <div className={cn('space-y-2', className)}>
      {links.map(link => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <ExternalLink className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-body-emphasis text-foreground truncate">{link.displayName}</p>
            {link.description && <p className="text-caption text-muted-foreground truncate">{link.description}</p>}
          </div>
        </a>
      ))}
      {canAdd && (
        <Button variant="outline" size="sm" className="gap-2 w-full" onClick={onAdd}>
          <Plus className="w-4 h-4" aria-hidden="true" />
          {t('callout.link')}
        </Button>
      )}
    </div>
  );
}
