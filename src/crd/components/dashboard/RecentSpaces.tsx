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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
          Array.from({ length: maxItems }).map((_, i) => <CompactSpaceCardSkeleton key={i} />)
        ) : (
          <>
            {placeholderShown && homeSpaceSettingsHref && <HomeSpacePlaceholder settingsHref={homeSpaceSettingsHref} />}
            {visibleSpaces.map(space => (
              <CompactSpaceCard key={space.id} {...space} onPinClick={space.isHomeSpace ? onPinClick : undefined} />
            ))}
          </>
        )}
      </div>
    </section>
  );
}
