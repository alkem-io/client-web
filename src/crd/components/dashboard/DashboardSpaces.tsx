import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Skeleton } from '@/crd/primitives/skeleton';
import type { SpaceHierarchyCardData } from './SpaceHierarchyCard';
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
      <div aria-busy="true" className={cn('space-y-6', className)}>
        {Array.from({ length: 2 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
          <div key={i} className="space-y-3">
            <div className="rounded-lg border border-border overflow-hidden flex flex-col sm:flex-row">
              <Skeleton className="aspect-video sm:aspect-auto sm:w-48 sm:h-28 shrink-0" />
              <div className="flex-1 p-4 space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pl-4">
              {Array.from({ length: 4 }).map((__, j) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                <div key={j} className="rounded-lg border border-border overflow-hidden">
                  <Skeleton className="aspect-video w-full" />
                  <div className="p-2">
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
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
