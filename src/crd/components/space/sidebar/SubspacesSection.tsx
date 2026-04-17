import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback } from '@/crd/primitives/avatar';

type SubspaceItem = {
  name: string;
  initials: string;
  color: string;
  href: string;
};

type SubspacesSectionProps = {
  subspaces: SubspaceItem[];
  showAll?: boolean;
  showAllHref?: string;
  onSubspaceClick?: (href: string) => void;
  className?: string;
};

export function SubspacesSection({
  subspaces,
  showAll,
  showAllHref,
  onSubspaceClick,
  className,
}: SubspacesSectionProps) {
  const { t } = useTranslation('crd-space');

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="uppercase text-label text-muted-foreground">{t('sidebar.subspaces')}</h3>
        {!showAll && showAllHref && (
          <a href={showAllHref} className="text-caption text-primary font-medium hover:underline">
            {t('sidebar.showAll')}
          </a>
        )}
      </div>
      <div className="space-y-1">
        {subspaces.map(subspace => (
          <a
            key={subspace.name}
            href={subspace.href}
            onClick={e => {
              if (onSubspaceClick) {
                e.preventDefault();
                onSubspaceClick(subspace.href);
              }
            }}
            className="group flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <div className="flex items-center gap-3">
              <Avatar className="w-7 h-7">
                <AvatarFallback
                  style={{
                    background: `color-mix(in srgb, ${subspace.color} 15%, transparent)`,
                    color: subspace.color,
                  }}
                  className="text-badge"
                >
                  {subspace.initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-body-emphasis text-foreground">{subspace.name}</span>
            </div>
            <ChevronRight
              className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              aria-hidden="true"
            />
          </a>
        ))}
      </div>
    </div>
  );
}
