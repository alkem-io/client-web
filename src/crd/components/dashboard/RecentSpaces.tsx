import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import type { CompactSpaceCardData } from './CompactSpaceCard';
import { CompactSpaceCard, CompactSpaceCardSkeleton } from './CompactSpaceCard';
import { HomeSpacePlaceholder } from './HomeSpacePlaceholder';

type RecentSpacesProps = {
  spaces: CompactSpaceCardData[];
  loading?: boolean;
  hasHomeSpace: boolean;
  homeSpaceSettingsHref?: string;
  /**
   * Maximum cards shown in the single row, counting the pin / home-space slot.
   * The grid is `lg:grid-cols-4`, so 4 keeps everything on one row; the rest is
   * reachable via "Explore all". Default 4.
   */
  maxItems?: number;
  onExploreAllClick?: () => void;
  onPinClick?: () => void;
  className?: string;
};

// Below md: one horizontal scroll strip, the next card peeking in. md and up: the grid.
const SPACE_STRIP_CLASS =
  '-m-1 flex gap-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden overflow-x-auto p-1 *:w-48 *:shrink-0 md:m-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:p-0 md:*:w-auto lg:grid-cols-4';

export function RecentSpaces({
  spaces,
  loading,
  hasHomeSpace,
  homeSpaceSettingsHref,
  maxItems = 4,
  onExploreAllClick,
  onPinClick,
  className,
}: RecentSpacesProps) {
  const { t } = useTranslation('crd-dashboard');

  // The pin-button placeholder (shown only when there is no home space) takes one
  // of the row's slots, so the space cards fill the remainder. When a home space
  // exists it is already the first entry in `spaces`, so no slot is reserved here.
  const placeholderShown = !hasHomeSpace && !!homeSpaceSettingsHref;
  const visibleSpaces = spaces.slice(0, Math.max(0, maxItems - (placeholderShown ? 1 : 0)));

  return (
    <section className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-section-title">{t('recentSpaces.title')}</h2>
        {onExploreAllClick && (
          <button
            type="button"
            onClick={onExploreAllClick}
            className="flex items-center gap-1 text-body-emphasis text-primary hover:opacity-80 transition-opacity focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-sm"
          >
            {t('recentSpaces.exploreAll')} <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */}
      {/* biome-ignore lint/a11y/useSemanticElements: role="list" restores list semantics after the Tailwind reset */}
      <ul role="list" className={SPACE_STRIP_CLASS}>
        {loading ? (
          Array.from({ length: maxItems }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
            <li key={i}>
              <CompactSpaceCardSkeleton />
            </li>
          ))
        ) : (
          <>
            {placeholderShown && homeSpaceSettingsHref && (
              <li>
                <HomeSpacePlaceholder settingsHref={homeSpaceSettingsHref} />
              </li>
            )}
            {visibleSpaces.map(space => (
              <li key={space.id}>
                <CompactSpaceCard {...space} onPinClick={space.isHomeSpace ? onPinClick : undefined} />
              </li>
            ))}
          </>
        )}
      </ul>
    </section>
  );
}
