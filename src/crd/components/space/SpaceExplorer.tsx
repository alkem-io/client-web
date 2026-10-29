import { ChevronDown, FolderOpen, Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SpaceCardData, SpaceCardParent } from '@/crd/components/space/SpaceCard';
import { SpaceCard, SpaceCardSkeleton } from '@/crd/components/space/SpaceCard';
import { TagsInput } from '@/crd/forms/tags-input';
import { contentColumnClass } from '@/crd/lib/contentColumn';
import { cn } from '@/crd/lib/utils';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';

export type SpacesFilterValue = 'all' | 'member';

export type SpaceTypeFilter = 'all' | 'spaces' | 'subspaces';
export type SpacePrivacyFilter = 'all' | 'public' | 'private';

export type SpaceExplorerProps = {
  /** The spaces to show, already filtered by every filter below. */
  spaces: SpaceCardData[];
  loading: boolean;
  hasMore?: boolean;
  searchTerms: string[];
  membershipFilter: SpacesFilterValue;
  authenticated: boolean;
  loadingSearchResults?: boolean;
  onSearchTermsChange: (terms: string[]) => void;
  onMembershipFilterChange?: (filter: SpacesFilterValue) => void;
  typeFilter: SpaceTypeFilter;
  onTypeFilterChange: (filter: SpaceTypeFilter) => void;
  privacyFilter: SpacePrivacyFilter;
  onPrivacyFilterChange: (filter: SpacePrivacyFilter) => void;
  onLoadMore: () => Promise<void>;
  onParentClick?: (parent: SpaceCardParent) => void;
  /** Reports how many cards the grid fits per row, whenever that changes — lets the consumer size batches in whole rows. */
  onColumnsChange?: (columns: number) => void;
  /** Override the card grid column classes. Default: auto-fill responsive grid. */
  gridClassName?: string;
  className?: string;
};

const SKELETON_COUNT = 6;

const filterLabelClassName = 'text-badge uppercase tracking-[0.08em] text-muted-foreground';

export function SpaceExplorer({
  spaces,
  loading,
  hasMore,
  searchTerms,
  membershipFilter,
  authenticated,
  loadingSearchResults,
  onSearchTermsChange,
  onMembershipFilterChange,
  typeFilter,
  onTypeFilterChange,
  privacyFilter,
  onPrivacyFilterChange,
  onLoadMore,
  onParentClick,
  onColumnsChange,
  gridClassName,
  className,
}: SpaceExplorerProps) {
  const { t } = useTranslation(['crd-exploreSpaces', 'crd-common']);
  const [loadingMore, setLoadingMore] = useState(false);

  const gridCols = gridClassName ?? 'grid-cols-[repeat(auto-fill,minmax(280px,1fr))]';

  // The skeleton grid and the card grid share the column template; measure whichever is on screen.
  const [gridElement, setGridElement] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (!gridElement || !onColumnsChange || typeof ResizeObserver === 'undefined') {
      return;
    }
    let reported = 0;
    const observer = new ResizeObserver(() => {
      const columns = getComputedStyle(gridElement).gridTemplateColumns.split(' ').filter(Boolean).length;
      if (columns > 0 && columns !== reported) {
        reported = columns;
        onColumnsChange(columns);
      }
    });
    observer.observe(gridElement);
    return () => observer.disconnect();
  }, [gridElement, onColumnsChange]);
  const cardsListClassName = cn('grid gap-6 list-none p-0 m-0', gridCols);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      await onLoadMore();
    } finally {
      setLoadingMore(false);
    }
  };

  const activeFilterCount = (privacyFilter !== 'all' ? 1 : 0) + (typeFilter !== 'all' ? 1 : 0);

  const clearFilters = () => {
    onPrivacyFilterChange('all');
    onTypeFilterChange('all');
    onMembershipFilterChange?.('all');
  };

  const showEmpty = spaces.length === 0 && !loading && !loadingSearchResults;
  const showSkeletons = loading && spaces.length === 0;

  return (
    <div className={cn('w-full px-6 md:px-8 py-8', className)}>
      <div className="grid grid-cols-12 gap-6">
        <div className={cn('col-span-12', contentColumnClass())}>
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-page-title text-foreground">{t('spaces.title')}</h1>
            <p className="mt-1 text-body text-muted-foreground">{t('spaces.subtitle')}</p>
          </div>

          {/* Search + Sort + Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Tag-based search input */}
            <TagsInput
              value={searchTerms}
              onChange={onSearchTermsChange}
              placeholder={t('spaces.searchPlaceholder')}
              className="flex-1"
              icon={<Search className="shrink-0 size-4 text-muted-foreground" />}
            />

            {/* Filters dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild={true}>
                <Button
                  variant="outline"
                  className={cn(
                    'gap-2 h-10 rounded-lg',
                    activeFilterCount > 0 ? 'text-primary border-primary' : 'text-foreground border-border'
                  )}
                >
                  <SlidersHorizontal className="size-3.5" />
                  {t('spaces.filters')}
                  {activeFilterCount > 0 && (
                    <Badge className="text-badge px-[5px] h-[18px] bg-primary text-primary-foreground rounded-full ml-0.5">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[200px]">
                {/* Membership section (server-side). Guests could only pick "All", so they don't get it. */}
                {authenticated && (
                  <>
                    <DropdownMenuLabel className={filterLabelClassName}>
                      {t('spaces.filterMembership')}
                    </DropdownMenuLabel>
                    <DropdownMenuCheckboxItem
                      checked={membershipFilter === 'all'}
                      onCheckedChange={() => onMembershipFilterChange?.('all')}
                    >
                      {t('spaces.filterAll')}
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={membershipFilter === 'member'}
                      onCheckedChange={() => onMembershipFilterChange?.('member')}
                    >
                      {t('spaces.filterMember')}
                    </DropdownMenuCheckboxItem>

                    <DropdownMenuSeparator />
                  </>
                )}

                {/* Privacy section (client-side) */}
                <DropdownMenuLabel className={filterLabelClassName}>{t('spaces.filterPrivacy')}</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={privacyFilter === 'all'}
                  onCheckedChange={() => onPrivacyFilterChange('all')}
                >
                  {t('spaces.filterAll')}
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={privacyFilter === 'public'}
                  onCheckedChange={() => onPrivacyFilterChange('public')}
                >
                  {t('spaces.filterPublicOnly')}
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={privacyFilter === 'private'}
                  onCheckedChange={() => onPrivacyFilterChange('private')}
                >
                  {t('spaces.filterPrivateOnly')}
                </DropdownMenuCheckboxItem>

                <DropdownMenuSeparator />

                {/* Type section (client-side) */}
                <DropdownMenuLabel className={filterLabelClassName}>{t('spaces.filterType')}</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={typeFilter === 'all'}
                  onCheckedChange={() => onTypeFilterChange('all')}
                >
                  {t('spaces.filterAllTypes')}
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={typeFilter === 'spaces'}
                  onCheckedChange={() => onTypeFilterChange('spaces')}
                >
                  {t('spaces.filterSpacesOnly')}
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={typeFilter === 'subspaces'}
                  onCheckedChange={() => onTypeFilterChange('subspaces')}
                >
                  {t('spaces.filterSubspacesOnly')}
                </DropdownMenuCheckboxItem>

                {activeFilterCount > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="w-full justify-start gap-2 text-destructive h-8"
                      >
                        <X className="size-3" />
                        {t('spaces.clearFilters')}
                      </Button>
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {privacyFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => onPrivacyFilterChange('all')}
                  className="inline-flex items-center gap-1 cursor-pointer rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 text-caption px-2.5 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {privacyFilter === 'public' ? t('spaces.filterPublicOnly') : t('spaces.filterPrivateOnly')}
                  <X aria-hidden="true" className="size-2.5" />
                  <span className="sr-only">, {t('spaces.removeFilter')}</span>
                </button>
              )}
              {typeFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => onTypeFilterChange('all')}
                  className="inline-flex items-center gap-1 cursor-pointer rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 text-caption px-2.5 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {typeFilter === 'spaces' ? t('spaces.filterSpacesOnly') : t('spaces.filterSubspacesOnly')}
                  <X aria-hidden="true" className="size-2.5" />
                  <span className="sr-only">, {t('spaces.removeFilter')}</span>
                </button>
              )}
            </div>
          )}

          {/* No count: the loaded spaces are only a page of the results, so any number would understate them. */}
          {searchTerms.length > 0 && !showSkeletons && spaces.length > 0 && (
            <p className="mb-4 text-body text-muted-foreground">
              {t('spaces.matchingTerms', { terms: searchTerms.join(', ') })}
            </p>
          )}

          {/* Loading search indicator */}
          {loadingSearchResults && (
            <output className="flex items-center justify-center py-8" aria-label={t('spaces.loading')}>
              <div className="animate-spin rounded-full size-6 border-2 border-border border-t-transparent" />
            </output>
          )}

          {/* Cards grid */}
          {showSkeletons ? (
            <output ref={setGridElement} className={cn('grid gap-6', gridCols)} aria-label={t('spaces.loading')}>
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders have no stable key
                <SpaceCardSkeleton key={i} />
              ))}
            </output>
          ) : spaces.length > 0 ? (
            // biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style
            // biome-ignore lint/a11y/useSemanticElements: role="list" restores list semantics after the list-style reset
            <ul ref={setGridElement} role="list" className={cardsListClassName} aria-label={t('spaces.spacesLabel')}>
              {spaces.map(space => (
                <li key={space.id}>
                  <SpaceCard space={space} onParentClick={onParentClick} />
                </li>
              ))}
            </ul>
          ) : null}

          {/* Empty state */}
          {showEmpty && (
            <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-dashed border-border rounded-xl bg-muted">
              <FolderOpen aria-hidden="true" className="size-10 text-muted-foreground opacity-50 mb-3" />
              <h3 className="text-subsection-title mb-1 text-foreground">{t('spaces.emptyTitle')}</h3>
              <p className="text-body text-muted-foreground max-w-[360px] mb-4">{t('spaces.emptyMessage')}</p>
              {activeFilterCount > 0 && (
                <Button variant="outline" onClick={clearFilters} className="gap-2">
                  <X className="size-3.5" />
                  {t('spaces.clearFilters')}
                </Button>
              )}
            </div>
          )}

          {/* Load More */}
          {/* While its own batch loads, Load more stays and shows it is busy. */}
          {hasMore && spaces.length > 0 && (!loading || loadingMore) && (
            <div className="flex justify-center mt-8">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
                aria-busy={loadingMore}
                className="gap-2"
              >
                {loadingMore ? (
                  <div className="animate-spin rounded-full size-4 border-2 border-current border-t-transparent" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
                {t('crd-common:loadMore')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
