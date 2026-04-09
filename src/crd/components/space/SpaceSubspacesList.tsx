import { Folder, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { SpaceCard, type SpaceCardData } from './SpaceCard';

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
  /**
   * Initial number of subspace cards rendered before a "Show more" button
   * appears. Defaults to 6 (a 3-column grid with 2 rows).
   */
  initialVisibleCount?: number;
  className?: string;
};

const DEFAULT_INITIAL_VISIBLE = 6;

/**
 * Aggregate tags across every subspace, sort by frequency desc then
 * alphabetically, and return the unique tag list. Mirrors the MUI
 * `SpaceFilter` behavior but pure and client-side.
 */
function collectTags(subspaces: SpaceCardData[]): string[] {
  const counts = new Map<string, number>();
  for (const subspace of subspaces) {
    for (const tag of subspace.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].toLocaleLowerCase().localeCompare(b[0].toLocaleLowerCase());
    })
    .map(([tag]) => tag);
}

export function SpaceSubspacesList({
  subspaces,
  title,
  subtitle,
  canCreate,
  onCreateClick,
  onSubspaceClick,
  initialVisibleCount = DEFAULT_INITIAL_VISIBLE,
  className,
}: SpaceSubspacesListProps) {
  const { t } = useTranslation('crd-space');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);

  const allTags = collectTags(subspaces);

  // Apply search + tag filter.
  let filtered = subspaces;
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      s => s.name.toLowerCase().includes(query) || s.description.toLowerCase().includes(query)
    );
  }
  if (selectedTags.length > 0) {
    filtered = filtered.filter(s => selectedTags.every(tag => s.tags.includes(tag)));
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
    setShowAll(false);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setShowAll(false);
  };

  const hasActiveFilter = searchQuery.length > 0 || selectedTags.length > 0;
  const visibleSubspaces = showAll ? filtered : filtered.slice(0, initialVisibleCount);
  const hiddenCount = filtered.length - visibleSubspaces.length;

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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
        <input
          type="text"
          placeholder={t('subspaces.search')}
          value={searchQuery}
          onChange={e => {
            setSearchQuery(e.target.value);
            setShowAll(false);
          }}
          aria-label={t('subspaces.search')}
          className="w-full h-10 pl-9 pr-4 border border-border bg-background rounded-lg text-sm text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary"
        />
      </div>

      {/* Tag filter chips — wrap onto multiple rows */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                aria-pressed={isSelected}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-full border whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState hasActiveFilter={hasActiveFilter} onClear={resetFilters} />
      ) : (
        <>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0 m-0">
            {visibleSubspaces.map(subspace => (
              <li key={subspace.id} className="h-full">
                <SpaceCard space={subspace} onClick={onSubspaceClick} />
              </li>
            ))}
          </ul>

          {/* Show more / show less */}
          {filtered.length > initialVisibleCount && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={() => setShowAll(prev => !prev)}>
                {showAll ? t('subspaces.showLess') : t('subspaces.showMore', { count: hiddenCount })}
              </Button>
            </div>
          )}
        </>
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
