import { Folder } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FilterResultsSummary } from '@/crd/components/common/FilterResultsSummary';
import { TagFilterPopover } from '@/crd/components/common/TagFilterPopover';
import { SearchField } from '@/crd/forms/SearchField';
import { useElementWidth } from '@/crd/hooks/useElementWidth';
import { hasVisibleExcerptText } from '@/crd/lib/markdownExcerpt';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { ExpandedSpaceCard, ROW_LAYOUT_MIN_WIDTH } from './ExpandedSpaceCard';
import { SpaceCard, type SpaceCardData } from './SpaceCard';

type StatusFilter = 'all' | 'active' | 'archived';

type SpaceSubspacesListProps = {
  subspaces: SpaceCardData[];
  /** Optional section title — heading is hidden when omitted. */
  title?: string;
  /** Optional subtitle rendered under the title. */
  subtitle?: string;
  onSubspaceClick?: (space: SpaceCardData) => void;
  /**
   * Card variant. `'compact'` (default) is today's 3-up grid with an
   * initial count of 6; `'expanded'` is one rich card per row with an initial count
   * of 3. Drives only the default `initialVisibleCount`
   * and card component — every other behaviour (search, filters, show more/less,
   * empty state) is identical in both variants.
   */
  variant?: 'compact' | 'expanded';
  /**
   * Initial number of subspace cards rendered before a "Show more" button
   * appears. Defaults to 6 for `'compact'`, 3 for `'expanded'`.
   */
  initialVisibleCount?: number;
  /** Hide the status filter pills and tag filter chips — keep only the search. */
  disableFilters?: boolean;
  className?: string;
};

const INITIAL_VISIBLE_COMPACT = 6;
const INITIAL_VISIBLE_EXPANDED = 3;

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
  onSubspaceClick,
  variant = 'compact',
  initialVisibleCount,
  disableFilters = false,
  className,
}: SpaceSubspacesListProps) {
  const { t } = useTranslation('crd-space');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showAll, setShowAll] = useState(false);
  // The list's own measured width (never a viewport breakpoint) decides whether an
  // all-empty expanded item constrains to the identity block's width or goes full width.
  const [listWidth, listWidthRef] = useElementWidth();

  const effectiveInitialVisibleCount =
    initialVisibleCount ?? (variant === 'expanded' ? INITIAL_VISIBLE_EXPANDED : INITIAL_VISIBLE_COMPACT);

  const allTags = disableFilters ? [] : collectTags(subspaces);

  // Show status filter pills only when subspaces carry status data and at least
  // one subspace has a non-active status (otherwise the pills add no value).
  const hasStatusVariety = !disableFilters && subspaces.some(s => s.status && s.status !== 'active');

  const STATUS_OPTIONS: StatusFilter[] = ['all', 'active', 'archived'];

  // Apply status + search + tag filters. When `disableFilters` is true, the
  // status/tag controls are hidden — also skip their predicates so any residual
  // state from before the prop flipped can't filter results invisibly.
  let filtered = subspaces;
  if (!disableFilters && statusFilter !== 'all') {
    filtered = filtered.filter(s => s.status === statusFilter);
  }
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      s => s.name.toLowerCase().includes(query) || s.description.toLowerCase().includes(query)
    );
  }
  if (!disableFilters && selectedTags.length > 0) {
    filtered = filtered.filter(s => selectedTags.every(tag => s.tags.includes(tag)));
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
    setShowAll(false);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setStatusFilter('all');
    setShowAll(false);
  };

  const hasActiveFilter =
    searchQuery.length > 0 || (!disableFilters && (selectedTags.length > 0 || statusFilter !== 'all'));
  const visibleSubspaces = showAll ? filtered : filtered.slice(0, effectiveInitialVisibleCount);
  const hiddenCount = filtered.length - visibleSubspaces.length;

  const showMoreToggle = filtered.length > effectiveInitialVisibleCount && (
    <div className="flex justify-center pt-4">
      <Button variant="outline" onClick={() => setShowAll(prev => !prev)}>
        {showAll ? t('subspaces.showLess') : t('subspaces.showMore', { count: hiddenCount })}
      </Button>
    </div>
  );

  return (
    <section className={cn('space-y-6', className)} aria-label={t('a11y.subspacesGrid')}>
      {/* Section header — rendered only when an explicit title is provided. */}
      {title && (
        <div>
          <h2 className="text-page-title text-foreground">{title}</h2>
          {subtitle && <p className="mt-1 text-body text-muted-foreground">{subtitle}</p>}
        </div>
      )}

      {/* Search + tag filter */}
      <div className="flex items-center gap-2">
        <SearchField
          value={searchQuery}
          onValueChange={value => {
            setSearchQuery(value);
            setShowAll(false);
          }}
          placeholder={t('subspaces.search')}
          ariaLabel={t('subspaces.search')}
          className="flex-1"
        />
        {!disableFilters && <TagFilterPopover tags={allTags} selectedTags={selectedTags} onTagClick={toggleTag} />}
      </div>

      {/* Status filter pills — only shown when subspaces have mixed statuses */}
      {hasStatusVariety && (
        <fieldset className="flex items-center gap-2 border-0 p-0 m-0" aria-label={t('a11y.statusFilter')}>
          <legend className="sr-only">{t('a11y.statusFilter')}</legend>
          {STATUS_OPTIONS.map(status => {
            const isSelected = statusFilter === status;
            return (
              <button
                key={status}
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  setStatusFilter(status);
                  setShowAll(false);
                }}
                className={cn(
                  'px-3 py-1.5 text-body-emphasis rounded-full border whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                )}
              >
                {t(`subspaces.filter.${status}`)}
              </button>
            );
          })}
        </fieldset>
      )}

      {/* Active search/tag filters summary */}
      <FilterResultsSummary
        searchTerm={searchQuery}
        tags={disableFilters ? undefined : selectedTags}
        onClear={() => {
          setSearchQuery('');
          if (!disableFilters) {
            setSelectedTags([]);
          }
          setShowAll(false);
        }}
      />

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState hasActiveFilter={hasActiveFilter} onClear={resetFilters} />
      ) : variant === 'expanded' ? (
        <>
          {/* One column — an expanded list is one rich card per row. The list's own
              measured width (not the screen) decides whether an all-empty item
              constrains to the identity block's width or goes full width. */}
          <ul ref={listWidthRef} className="grid grid-cols-1 gap-4 list-none p-0 m-0">
            {visibleSubspaces.map(subspace => {
              // The data mapper decides excerpt visibility once per fetch; the fallback
              // parse only runs for callers that hand in bare card data (previews, tests).
              const sectionVisibility = subspace.sectionVisibility ?? {
                what: hasVisibleExcerptText(subspace.what),
                why: hasVisibleExcerptText(subspace.why),
                who: hasVisibleExcerptText(subspace.who),
              };
              const hasExcerpt = sectionVisibility.what || sectionVisibility.why || sectionVisibility.who;
              if (hasExcerpt) {
                return (
                  <li key={subspace.id}>
                    <ExpandedSpaceCard
                      space={subspace}
                      onClick={onSubspaceClick}
                      sectionVisibility={sectionVisibility}
                    />
                  </li>
                );
              }
              // All three sections empty → the normal compact card, at the identity block's
              // width when the list is wide enough for side-by-side, full width otherwise —
              // exactly what a stacked expanded card's identity block would occupy.
              return (
                <li
                  key={subspace.id}
                  className={cn('h-full', (listWidth ?? 0) >= ROW_LAYOUT_MIN_WIDTH && 'max-w-[300px]')}
                >
                  <SpaceCard space={subspace} onClick={onSubspaceClick} />
                </li>
              );
            })}
          </ul>

          {showMoreToggle}
        </>
      ) : (
        <>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0 m-0">
            {visibleSubspaces.map(subspace => (
              <li key={subspace.id} className="h-full">
                <SpaceCard space={subspace} onClick={onSubspaceClick} />
              </li>
            ))}
          </ul>

          {showMoreToggle}
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
      <h3 className="text-subsection-title text-foreground">{t('subspaces.empty.title')}</h3>
      <p className="text-body text-muted-foreground mt-1">{t('subspaces.empty.description')}</p>
      {hasActiveFilter && (
        <Button variant="link" className="mt-2 text-primary" onClick={onClear}>
          {t('subspaces.empty.clearFilters')}
        </Button>
      )}
    </div>
  );
}
