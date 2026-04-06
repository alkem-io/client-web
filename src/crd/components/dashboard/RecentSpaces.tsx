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
  onExploreAllClick?: () => void;
  className?: string;
};

export function RecentSpaces({
  spaces,
  loading,
  hasHomeSpace,
  homeSpaceSettingsHref,
  onExploreAllClick,
  className,
}: RecentSpacesProps) {
  const { t } = useTranslation('crd-dashboard');

  return (
    <section className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('recentSpaces.title')}</h2>
        {onExploreAllClick && (
          <button
            type="button"
            onClick={onExploreAllClick}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:opacity-80 transition-opacity"
          >
            {t('recentSpaces.exploreAll')} <ArrowRight className="size-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <CompactSpaceCardSkeleton key={i} />)
        ) : (
          <>
            {!hasHomeSpace && homeSpaceSettingsHref && <HomeSpacePlaceholder settingsHref={homeSpaceSettingsHref} />}
            {spaces.map(space => (
              <CompactSpaceCard key={space.id} {...space} />
            ))}
          </>
        )}
      </div>
    </section>
  );
}
