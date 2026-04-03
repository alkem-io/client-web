import { Pin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';

export type SpaceHierarchyCardData = {
  id: string;
  name: string;
  href: string;
  tagline?: string;
  bannerUrl?: string;
  isHomeSpace: boolean;
  subspaces: Array<{
    id: string;
    name: string;
    href: string;
  }>;
};

type SpaceHierarchyCardProps = SpaceHierarchyCardData & {
  onSeeMoreSubspaces?: () => void;
  className?: string;
};

export function SpaceHierarchyCard({
  name,
  href,
  tagline,
  bannerUrl,
  isHomeSpace,
  subspaces,
  onSeeMoreSubspaces,
  className,
}: SpaceHierarchyCardProps) {
  const { t } = useTranslation('crd-dashboard');

  return (
    <div className={cn('rounded-lg border border-border bg-card overflow-hidden', className)}>
      <a href={href} className="block">
        <div className="relative aspect-[3/1] overflow-hidden">
          {bannerUrl ? (
            <img src={bannerUrl} alt="" className="size-full object-cover" aria-hidden="true" />
          ) : (
            <div className="size-full bg-gradient-to-br from-muted to-accent" aria-hidden="true" />
          )}
          {isHomeSpace && (
            <span className="absolute top-1.5 left-1.5" aria-hidden="true">
              <Pin size={14} className="text-white drop-shadow" />
            </span>
          )}
        </div>
      </a>
      <div className="p-4">
        <a href={href} className="font-semibold text-lg hover:underline">
          {name}
        </a>
        {tagline && <p className="text-sm text-muted-foreground mt-1">{tagline}</p>}
        {subspaces.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {subspaces.map(subspace => (
              <a
                key={subspace.id}
                href={subspace.href}
                className="text-xs px-2 py-1 rounded-full bg-muted hover:bg-accent transition-colors"
              >
                {subspace.name}
              </a>
            ))}
            {onSeeMoreSubspaces && (
              <button
                type="button"
                onClick={onSeeMoreSubspaces}
                className="text-xs text-primary hover:underline cursor-pointer"
              >
                {t('spaces.seeMoreSubspaces')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
