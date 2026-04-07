import { Lock, Pin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';

export type SubspaceCardData = {
  id: string;
  name: string;
  href: string;
  bannerUrl?: string;
  isPrivate: boolean;
};

export type SpaceHierarchyCardData = {
  id: string;
  name: string;
  href: string;
  tagline?: string;
  bannerUrl?: string;
  isHomeSpace: boolean;
  subspaces: SubspaceCardData[];
};

type SpaceHierarchyCardProps = SpaceHierarchyCardData & {
  onSeeMoreSubspaces?: () => void;
  visibleSubspaces?: number;
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
  visibleSubspaces = 4,
  className,
}: SpaceHierarchyCardProps) {
  const { t } = useTranslation('crd-dashboard');
  const displayedSubspaces = subspaces.slice(0, visibleSubspaces);
  const hasMoreSubspaces = subspaces.length > visibleSubspaces;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Parent space — horizontal card */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          <a
            href={href}
            className="relative block shrink-0 sm:w-48 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <div className="aspect-video sm:aspect-auto sm:h-full overflow-hidden">
              {bannerUrl ? (
                <img
                  src={bannerUrl}
                  alt=""
                  className="size-full object-cover transition-transform duration-500 hover:scale-105"
                  aria-hidden="true"
                />
              ) : (
                <div className="size-full bg-gradient-to-br from-muted to-accent" aria-hidden="true" />
              )}
            </div>
            {isHomeSpace && (
              <span className="absolute top-2 left-2" aria-hidden="true">
                <Pin size={14} className="text-white drop-shadow" />
              </span>
            )}
          </a>

          <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
            <a
              href={href}
              className="font-semibold text-base hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-sm"
            >
              {name}
            </a>
            {tagline && <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{tagline}</p>}
          </div>
        </div>
      </div>

      {/* Subspaces grid */}
      {displayedSubspaces.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {displayedSubspaces.map(subspace => (
            <a
              key={subspace.id}
              href={subspace.href}
              className="group block rounded-lg border border-border bg-card overflow-hidden transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <div className="relative aspect-video overflow-hidden">
                {subspace.bannerUrl ? (
                  <img
                    src={subspace.bannerUrl}
                    alt=""
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    aria-hidden="true"
                  />
                ) : (
                  <div className="size-full bg-gradient-to-br from-muted to-accent" aria-hidden="true" />
                )}
                {subspace.isPrivate && (
                  <div
                    role="img"
                    className="absolute top-2 right-2 flex items-center rounded-full p-1"
                    style={{ background: 'color-mix(in srgb, var(--foreground) 50%, transparent)' }}
                    aria-label={t('recentSpaces.private')}
                  >
                    <Lock size={10} className="text-primary-foreground" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="truncate text-xs font-medium">{subspace.name}</p>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* See more subspaces */}
      {hasMoreSubspaces && onSeeMoreSubspaces && (
        <div>
          <button
            type="button"
            onClick={onSeeMoreSubspaces}
            className="text-xs text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-sm"
          >
            {t('spaces.seeMoreSubspaces')}
          </button>
        </div>
      )}
    </div>
  );
}
