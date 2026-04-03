import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import type { CompactSpaceCardData } from '@/main/crdPages/dashboard/dashboardDataMappers';
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
    <section className={cn('space-y-3', className)}>
      <div className="flex gap-4 overflow-x-auto pb-2">
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
      {onExploreAllClick && (
        <div className="text-center">
          <button type="button" onClick={onExploreAllClick} className="text-sm text-primary hover:underline">
            {t('recentSpaces.exploreAll')}
          </button>
        </div>
      )}
    </section>
  );
}
