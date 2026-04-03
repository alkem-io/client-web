import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Skeleton } from '@/crd/primitives/skeleton';
import type { SpaceHierarchyCardData } from '@/main/crdPages/dashboard/dashboardDataMappers';
import { SpaceHierarchyCard } from './SpaceHierarchyCard';

type DashboardSpacesProps = {
  spaces: SpaceHierarchyCardData[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onSeeMoreSubspaces?: (spaceId: string) => void;
  className?: string;
};

export function DashboardSpaces({
  spaces,
  loading,
  hasMore,
  onLoadMore,
  onSeeMoreSubspaces,
  className,
}: DashboardSpacesProps) {
  const { t } = useTranslation('crd-dashboard');

  if (loading && spaces.length === 0) {
    return (
      <div aria-busy="true" className={cn('space-y-4', className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border overflow-hidden">
            <Skeleton className="aspect-[3/1] w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {spaces.map(space => (
        <SpaceHierarchyCard
          key={space.id}
          {...space}
          onSeeMoreSubspaces={onSeeMoreSubspaces ? () => onSeeMoreSubspaces(space.id) : undefined}
        />
      ))}
      {hasMore && onLoadMore && (
        <div className="text-center pt-2">
          <Button variant="outline" size="sm" onClick={onLoadMore}>
            {t('spaces.loadMore')}
          </Button>
        </div>
      )}
    </div>
  );
}
