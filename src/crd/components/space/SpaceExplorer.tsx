import { ArrowUpDown, ChevronDown, FolderOpen, Search, SlidersHorizontal, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SpaceCardData, SpaceCardParent } from '@/crd/components/space/SpaceCard';
import { SpaceCard, SpaceCardSkeleton } from '@/crd/components/space/SpaceCard';
import { TagsInput } from '@/crd/forms/tags-input';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/crd/primitives/select';

export type SpacesFilterValue = 'all' | 'member' | 'public';

type SortOption = 'recent' | 'alpha' | 'active';
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
  const { t } = useTranslation('crd');
  const [loadingMore, setLoadingMore] = useState(false);

  // Client-side filters & sorting
  const [sortBy, setSortBy] = useState<SortOption>('recent');
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

  // Client-side filtering + sorting
  const displayedSpaces = useMemo(() => {
    let result = [...spaces];

    // Privacy filter
    if (privacyFilter === 'public') result = result.filter(s => !s.isPrivate);
    if (privacyFilter === 'private') result = result.filter(s => s.isPrivate);

    // Type filter
    if (typeFilter === 'spaces') result = result.filter(s => !s.parent);
    if (typeFilter === 'subspaces') result = result.filter(s => !!s.parent);

    // Sort
    if (sortBy === 'alpha') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }
    // 'recent' and 'active' keep server order (we don't have activity data)

    return result;
  }, [spaces, privacyFilter, typeFilter, sortBy]);

  const activeFilterCount = (privacyFilter !== 'all' ? 1 : 0) + (typeFilter !== 'all' ? 1 : 0);

  const clearFilters = () => {
    setPrivacyFilter('all');
    setTypeFilter('all');
    setSortBy('recent');
    onMembershipFilterChange?.('all');
  };

  const showEmpty = displayedSpaces.length === 0 && !loading && !loadingSearchResults;
  const showSkeletons = loading && spaces.length === 0;

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
          {t('spaces.title')}
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
          {t('spaces.subtitle')}
        </p>
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

        {/* Sort dropdown */}
        <Select value={sortBy} onValueChange={v => setSortBy(v as SortOption)}>
          <SelectTrigger
            aria-label={t('spaces.sortBy')}
            className="gap-2"
            style={{
              width: 'auto',
              minWidth: 160,
              height: 40,
              fontSize: 'var(--text-sm)',
              background: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
            }}
          >
            <ArrowUpDown className="size-3.5 text-muted-foreground" />
            <SelectValue placeholder={t('spaces.sortBy')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">{t('spaces.sortRecent')}</SelectItem>
            <SelectItem value="alpha">{t('spaces.sortAlpha')}</SelectItem>
            <SelectItem value="active">{t('spaces.sortActive')}</SelectItem>
          </SelectContent>
        </Select>

        {/* Filters dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild={true}>
            <Button
              variant="outline"
              className="gap-2"
              style={{
                height: 40,
                fontSize: 'var(--text-sm)',
                borderRadius: 'var(--radius)',
                color: activeFilterCount > 0 ? 'var(--primary)' : 'var(--foreground)',
                borderColor: activeFilterCount > 0 ? 'var(--primary)' : 'var(--border)',
              }}
            >
              <SlidersHorizontal className="size-3.5" />
              {t('spaces.filters')}
              {activeFilterCount > 0 && (
                <Badge
                  style={{
                    fontSize: '10px',
                    padding: '0 5px',
                    height: 18,
                    background: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                    borderRadius: '999px',
                    marginLeft: 2,
                  }}
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" style={{ minWidth: 200 }}>
            {/* Membership section (server-side) */}
            <DropdownMenuLabel
              style={{
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--muted-foreground)',
              }}
            >
              {t('spaces.filterMembership')}
            </DropdownMenuLabel>
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
            <DropdownMenuLabel
              style={{
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--muted-foreground)',
              }}
            >
              {t('spaces.filterPrivacy')}
            </DropdownMenuLabel>
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
            <DropdownMenuLabel
              style={{
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--muted-foreground)',
              }}
            >
              {t('spaces.filterType')}
            </DropdownMenuLabel>
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
                <div style={{ padding: '4px 8px' }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="w-full justify-start gap-2"
                    style={{ fontSize: 'var(--text-sm)', color: 'var(--destructive)', height: 32 }}
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
              className="inline-flex items-center gap-1 cursor-pointer rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              {privacyFilter === 'public' ? t('spaces.filterPublicOnly') : t('spaces.filterPrivateOnly')}
              <X aria-hidden="true" className="size-2.5" />
              <span className="sr-only">, remove filter</span>
            </button>
          )}
          {typeFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className="inline-flex items-center gap-1 cursor-pointer rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              {typeFilter === 'spaces' ? t('spaces.filterSpacesOnly') : t('spaces.filterSubspacesOnly')}
              <X aria-hidden="true" className="size-2.5" />
              <span className="sr-only">, remove filter</span>
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      {!showSkeletons && displayedSpaces.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            {t('spaces.showing')}{' '}
            <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{displayedSpaces.length}</span>{' '}
            {t('spaces.of')} <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{spaces.length}</span>{' '}
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
        <output
          className="grid gap-6"
          aria-label={t('spaces.loading')}
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
        >
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders have no stable key
            <SpaceCardSkeleton key={i} />
          ))}
        </output>
      ) : displayedSpaces.length > 0 ? (
        <ul
          className="grid gap-6 list-none p-0 m-0"
          aria-label={t('spaces.spacesLabel')}
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
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
        <div
          className="flex flex-col items-center justify-center text-center"
          style={{
            padding: '64px 24px',
            border: '1px dashed var(--border)',
            borderRadius: 'calc(var(--radius) + 4px)',
            background: 'var(--muted)',
          }}
        >
          <FolderOpen aria-hidden="true" className="size-10 text-muted-foreground opacity-50 mb-3" />
          <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
            {t('spaces.emptyTitle')}
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)', maxWidth: 360, lineHeight: 1.5 }}>
            {t('spaces.emptyMessage')}
          </p>
          {activeFilterCount > 0 && (
            <Button variant="outline" onClick={clearFilters} className="gap-2" style={{ fontSize: 'var(--text-sm)' }}>
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
            {t('spaces.loadMore')}
          </Button>
        </div>
      )}
    </div>
  );
}
