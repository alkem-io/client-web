import { Bot } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';

type VirtualContributorItem = {
  name: string;
  description?: string;
  avatarUrl?: string;
  initials: string;
  href?: string;
};

type VirtualContributorsSectionProps = {
  contributors: VirtualContributorItem[];
  onContributorClick?: (href: string) => void;
  className?: string;
};

export function VirtualContributorsSection({
  contributors,
  onContributorClick,
  className,
}: VirtualContributorsSectionProps) {
  const { t } = useTranslation('crd-space');

  if (contributors.length === 0) return null;

  return (
    <div className={cn('bg-card border border-border rounded-lg p-4', className)}>
      <div className="flex items-center gap-1.5 mb-3">
        <Bot className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
        <h3 className="uppercase text-label text-muted-foreground">{t('sidebar.virtualContributors')}</h3>
      </div>
      <div className="space-y-2">
        {contributors.map(vc => (
          <button
            key={vc.name}
            type="button"
            className="flex items-start gap-3 w-full text-left px-3 py-2.5 rounded-md hover:bg-muted/50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => vc.href && onContributorClick?.(vc.href)}
          >
            <Avatar className="w-8 h-8 shrink-0">
              {vc.avatarUrl && <AvatarImage src={vc.avatarUrl} alt={vc.name} />}
              <AvatarFallback
                style={{
                  background: 'color-mix(in srgb, var(--info) 15%, transparent)',
                  color: 'var(--info)',
                }}
                className="text-badge"
              >
                {vc.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-body-emphasis text-foreground">{vc.name}</p>
              {vc.description && (
                <p className="line-clamp-2 text-caption text-muted-foreground mt-0.5">{vc.description}</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
