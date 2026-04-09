import { Folder, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { SpaceCard, type SpaceCardData } from './SpaceCard';

type SubspaceFilter = 'all' | 'active' | 'archived';

type SpaceSubspacesListProps = {
  subspaces: SpaceCardData[];
  /** Optional title override — defaults to t('subspaces.title'). */
  title?: string;
  /** Optional subtitle override — defaults to t('subspaces.subtitle'). */
  subtitle?: string;
  /** "Create Subspace" button only renders when both `canCreate` and `onCreateClick` are set. */
  canCreate?: boolean;
  onCreateClick?: () => void;
  onSubspaceClick?: (space: SpaceCardData) => void;
  className?: string;
};

const FILTERS: SubspaceFilter[] = ['all', 'active', 'archived'];

export function SpaceSubspacesList({
  subspaces,
  title,
  subtitle,
  canCreate,
  onCreateClick,
  onSubspaceClick,
  className,
}: SpaceSubspacesListProps) {
  const { t } = useTranslation('crd-space');
  const [activeFilter, setActiveFilter] = useState<SubspaceFilter>('all');

  const filterLabels: Record<SubspaceFilter, string> = {
    all: t('subspaces.filterAll'),
    active: t('subspaces.filterActive'),
    archived: t('subspaces.filterArchived'),
  };

  // Apply status filter. Real data currently exposes no archived status, so
  // the filter is a visual affordance — "active" and "all" show the same set,
  // "archived" shows empty.
  let filtered: SpaceCardData[];
  if (activeFilter === 'archived') {
    filtered = [];
  } else {
    filtered = subspaces;
  }

  const resetFilters = () => setActiveFilter('all');
  const hasActiveFilter = activeFilter !== 'all';

  return (
    <section className={cn('space-y-6', className)} aria-label={t('a11y.subspacesGrid')}>
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">{title ?? t('subspaces.title')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle ?? t('subspaces.subtitle')}</p>
        </div>
        {canCreate && onCreateClick && (
          <Button className="shrink-0 gap-2" onClick={onCreateClick}>
            <Plus className="w-4 h-4" aria-hidden="true" />
            {t('subspaces.createSubspace')}
          </Button>
        )}
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
        {FILTERS.map(filter => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              aria-pressed={isActive}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-full border whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isActive
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground'
              )}
            >
              {filterLabels[filter]}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState hasActiveFilter={hasActiveFilter} onClear={resetFilters} />
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0 m-0">
          {filtered.map(subspace => (
            <li key={subspace.id} className="h-full">
              <SpaceCard space={subspace} onClick={onSubspaceClick} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function EmptyState({ hasActiveFilter, onClear }: { hasActiveFilter: boolean; onClear: () => void }) {
  const { t } = useTranslation('crd-space');
  return (
    <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-border rounded-lg">
      <Folder className="w-10 h-10 text-muted-foreground opacity-50 mb-3" aria-hidden="true" />
      <h3 className="text-lg font-medium text-foreground">{t('subspaces.empty.title')}</h3>
      <p className="text-sm text-muted-foreground mt-1">{t('subspaces.empty.description')}</p>
      {hasActiveFilter && (
        <Button variant="link" className="mt-2 text-primary" onClick={onClear}>
          {t('subspaces.empty.clearFilters')}
        </Button>
      )}
    </div>
  );
}
