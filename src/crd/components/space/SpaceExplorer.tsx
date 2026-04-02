import { ChevronDown, FolderOpen, Search, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SpaceCardData, SpaceCardParent } from '@/crd/components/space/SpaceCard';
import { SpaceCard, SpaceCardSkeleton } from '@/crd/components/space/SpaceCard';
import { TagsInput } from '@/crd/forms/tags-input';
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

export type SpacesFilterValue = 'all' | 'member' | 'public';

type TypeFilter = 'all' | 'spaces' | 'subspaces';
type PrivacyFilter = 'all' | 'public' | 'private';

export type SpaceExplorerProps = {
  spaces: SpaceCardData[];
  loading: boolean;
  hasMore?: boolean;
  searchTerms: string[];
  membershipFilter: SpacesFilterValue;
  authenticated: boolean;
  loadingSearchResults?: boolean;
  onSearchTermsChange: (terms: string[]) => void;
  onMembershipFilterChange?: (filter: SpacesFilterValue) => void;
  onLoadMore: () => Promise<void>;
  onParentClick?: (parent: SpaceCardParent) => void;
};

const SKELETON_COUNT = 6;

const filterLabelClassName = 'text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground';

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
  onLoadMore,
  onParentClick,
}: SpaceExplorerProps) {
  const { t } = useTranslation(['crd-exploreSpaces', 'crd-common']);
  const [loadingMore, setLoadingMore] = useState(false);

  // Client-side filters
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [privacyFilter, setPrivacyFilter] = useState<PrivacyFilter>('all');

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      await onLoadMore();
    } finally {
      setLoadingMore(false);
    }
  };

  // Client-side filtering
  const displayedSpaces = (() => {
    let result = spaces;

    if (privacyFilter === 'public') result = result.filter(s => !s.isPrivate);
    if (privacyFilter === 'private') result = result.filter(s => s.isPrivate);

    if (typeFilter === 'spaces') result = result.filter(s => !s.parent);
    if (typeFilter === 'subspaces') result = result.filter(s => !!s.parent);

    return result;
  })();

  const activeFilterCount = (privacyFilter !== 'all' ? 1 : 0) + (typeFilter !== 'all' ? 1 : 0);

  const clearFilters = () => {
    setPrivacyFilter('all');
    setTypeFilter('all');
    onMembershipFilterChange?.('all');
  };

  const showEmpty = displayedSpaces.length === 0 && !loading && !loadingSearchResults;
  const showSkeletons = loading && spaces.length === 0;

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('spaces.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('spaces.subtitle')}</p>
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
                'gap-2 h-10 text-sm rounded-lg',
                activeFilterCount > 0 ? 'text-primary border-primary' : 'text-foreground border-border'
              )}
            >
              <SlidersHorizontal className="size-3.5" />
              {t('spaces.filters')}
              {activeFilterCount > 0 && (
                <Badge className="text-[10px] px-[5px] h-[18px] bg-primary text-primary-foreground rounded-full ml-0.5">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[200px]">
            {/* Membership section (server-side) */}
            <DropdownMenuLabel className={filterLabelClassName}>{t('spaces.filterMembership')}</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={membershipFilter === 'all'}
              onCheckedChange={() => onMembershipFilterChange?.('all')}
            >
              {t('spaces.filterAll')}
            </DropdownMenuCheckboxItem>
            {authenticated && (
              <DropdownMenuCheckboxItem
                checked={membershipFilter === 'member'}
                onCheckedChange={() => onMembershipFilterChange?.('member')}
              >
                {t('spaces.filterMember')}
              </DropdownMenuCheckboxItem>
            )}
            <DropdownMenuCheckboxItem
              checked={membershipFilter === 'public'}
              onCheckedChange={() => onMembershipFilterChange?.('public')}
            >
              {t('spaces.filterPublic')}
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator />

            {/* Privacy section (client-side) */}
            <DropdownMenuLabel className={filterLabelClassName}>{t('spaces.filterPrivacy')}</DropdownMenuLabel>
            <DropdownMenuCheckboxItem checked={privacyFilter === 'all'} onCheckedChange={() => setPrivacyFilter('all')}>
              {t('spaces.filterAll')}
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={privacyFilter === 'public'}
              onCheckedChange={() => setPrivacyFilter('public')}
            >
              {t('spaces.filterPublicOnly')}
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={privacyFilter === 'private'}
              onCheckedChange={() => setPrivacyFilter('private')}
            >
              {t('spaces.filterPrivateOnly')}
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator />

            {/* Type section (client-side) */}
            <DropdownMenuLabel className={filterLabelClassName}>{t('spaces.filterType')}</DropdownMenuLabel>
            <DropdownMenuCheckboxItem checked={typeFilter === 'all'} onCheckedChange={() => setTypeFilter('all')}>
              {t('spaces.filterAllTypes')}
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={typeFilter === 'spaces'} onCheckedChange={() => setTypeFilter('spaces')}>
              {t('spaces.filterSpacesOnly')}
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={typeFilter === 'subspaces'}
              onCheckedChange={() => setTypeFilter('subspaces')}
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
                    className="w-full justify-start gap-2 text-sm text-destructive h-8"
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
              onClick={() => setPrivacyFilter('all')}
              className="inline-flex items-center gap-1 cursor-pointer rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 text-[11px] px-2.5 py-1"
            >
              {privacyFilter === 'public' ? t('spaces.filterPublicOnly') : t('spaces.filterPrivateOnly')}
              <X aria-hidden="true" className="size-2.5" />
              <span className="sr-only">, {t('spaces.removeFilter')}</span>
            </button>
          )}
          {typeFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className="inline-flex items-center gap-1 cursor-pointer rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 text-[11px] px-2.5 py-1"
            >
              {typeFilter === 'spaces' ? t('spaces.filterSpacesOnly') : t('spaces.filterSubspacesOnly')}
              <X aria-hidden="true" className="size-2.5" />
              <span className="sr-only">, {t('spaces.removeFilter')}</span>
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      {!showSkeletons && displayedSpaces.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {t('spaces.showing')} <span className="font-semibold text-foreground">{displayedSpaces.length}</span>{' '}
            {activeFilterCount === 0 && (
              <>
                {t('spaces.of')} <span className="font-semibold text-foreground">{spaces.length}</span>{' '}
              </>
            )}
            {t('spaces.spacesLabel')}
          </p>
        </div>
      )}

      {/* Loading search indicator */}
      {loadingSearchResults && (
        <output className="flex items-center justify-center py-8" aria-label={t('spaces.loading')}>
          <div className="animate-spin rounded-full size-6 border-2 border-border border-t-transparent" />
        </output>
      )}

      {/* Cards grid */}
      {showSkeletons ? (
        <output className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]" aria-label={t('spaces.loading')}>
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders have no stable key
            <SpaceCardSkeleton key={i} />
          ))}
        </output>
      ) : displayedSpaces.length > 0 ? (
        <ul
          className="grid gap-6 list-none p-0 m-0 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]"
          aria-label={t('spaces.spacesLabel')}
        >
          {displayedSpaces.map(space => (
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
          <h3 className="text-base font-semibold mb-1 text-foreground">{t('spaces.emptyTitle')}</h3>
          <p className="text-sm text-muted-foreground max-w-[360px] leading-normal mb-4">{t('spaces.emptyMessage')}</p>
          {activeFilterCount > 0 && (
            <Button variant="outline" onClick={clearFilters} className="gap-2 text-sm">
              <X className="size-3.5" />
              {t('spaces.clearFilters')}
            </Button>
          )}
        </div>
      )}

      {/* Load More */}
      {hasMore && displayedSpaces.length > 0 && !loading && (
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
  );
}
