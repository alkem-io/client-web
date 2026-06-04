import { Bot, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';

type VirtualContributorItem = {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  initials: string;
  href?: string;
};

type VirtualContributorsSectionProps = {
  contributors: VirtualContributorItem[];
  onContributorClick?: (href: string) => void;
  /** When provided, an "Invite Virtual Contributor" entry is shown (admins only). */
  onInviteVc?: () => void;
  className?: string;
};

export function VirtualContributorsSection({
  contributors,
  onContributorClick,
  onInviteVc,
  className,
}: VirtualContributorsSectionProps) {
  const { t } = useTranslation('crd-space');

  // Render even with zero VCs when the user can invite — so the first VC can be
  // added (mirrors MUI's VirtualContributorsBlock).
  if (contributors.length === 0 && !onInviteVc) return null;

  return (
    <div className={cn('bg-card border border-border rounded-lg p-4', className)}>
      <div className="flex items-center gap-1.5 mb-3">
        <Bot className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
        <h3 className="uppercase text-label text-muted-foreground">{t('sidebar.virtualContributors')}</h3>
      </div>
      <div className="space-y-2">
        {contributors.map(vc => {
          const body = (
            <>
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
            </>
          );

          const rowClass = 'flex items-start gap-3 w-full text-left px-3 py-2.5 rounded-md transition-colors';

          return vc.href ? (
            <a
              key={vc.id}
              href={vc.href}
              className={cn(
                rowClass,
                'cursor-pointer hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
              )}
              onClick={e => {
                if (onContributorClick && vc.href) {
                  e.preventDefault();
                  onContributorClick(vc.href);
                }
              }}
            >
              {body}
            </a>
          ) : (
            <div key={vc.id} className={rowClass}>
              {body}
            </div>
          );
        })}
        {onInviteVc && (
          <button
            type="button"
            onClick={onInviteVc}
            className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-md transition-colors cursor-pointer hover:bg-muted/50 text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-dashed border-border">
              <Plus aria-hidden="true" className="size-4" />
            </span>
            <span className="text-body-emphasis italic">{t('sidebar.inviteVirtualContributor')}</span>
          </button>
        )}
      </div>
    </div>
  );
}
