import { ArrowUpDown, ChevronDown, FolderOpen, Search, SlidersHorizontal, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SpaceCardData, SpaceCardParent } from '@/crd/components/space/SpaceCard';
import { SpaceCard, SpaceCardSkeleton } from '@/crd/components/space/SpaceCard';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { TagsInput } from '@/crd/forms/tags-input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/crd/primitives/select';

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
  const { t } = useTranslation();
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
          {t('crd.spaces.title')}
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
          {t('crd.spaces.subtitle')}
        </p>
      </div>

      {/* Search + Sort + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Tag-based search input */}
        <TagsInput
          value={searchTerms}
          onChange={onSearchTermsChange}
          placeholder={t('crd.spaces.searchPlaceholder')}
          className="flex-1"
          icon={<Search className="shrink-0" style={{ width: 16, height: 16, color: 'var(--muted-foreground)' }} />}
        />

        {/* Sort dropdown */}
        <Select value={sortBy} onValueChange={v => setSortBy(v as SortOption)}>
          <SelectTrigger
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
            <ArrowUpDown style={{ width: 14, height: 14, color: 'var(--muted-foreground)' }} />
            <SelectValue placeholder={t('crd.spaces.sortBy')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">{t('crd.spaces.sortRecent')}</SelectItem>
            <SelectItem value="alpha">{t('crd.spaces.sortAlpha')}</SelectItem>
            <SelectItem value="active">{t('crd.spaces.sortActive')}</SelectItem>
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
              <SlidersHorizontal style={{ width: 14, height: 14 }} />
              {t('crd.spaces.filters')}
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
              style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-foreground)' }}
            >
              {t('crd.spaces.filterMembership')}
            </DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={membershipFilter === 'all'}
              onCheckedChange={() => onMembershipFilterChange?.('all')}
            >
              {t('crd.spaces.filterAll')}
            </DropdownMenuCheckboxItem>
            {authenticated && (
              <DropdownMenuCheckboxItem
                checked={membershipFilter === 'member'}
                onCheckedChange={() => onMembershipFilterChange?.('member')}
              >
                {t('crd.spaces.filterMember')}
              </DropdownMenuCheckboxItem>
            )}
            <DropdownMenuCheckboxItem
              checked={membershipFilter === 'public'}
              onCheckedChange={() => onMembershipFilterChange?.('public')}
            >
              {t('crd.spaces.filterPublic')}
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator />

            {/* Privacy section (client-side) */}
            <DropdownMenuLabel
              style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-foreground)' }}
            >
              {t('crd.spaces.filterPrivacy')}
            </DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={privacyFilter === 'all'}
              onCheckedChange={() => setPrivacyFilter('all')}
            >
              {t('crd.spaces.filterAll')}
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={privacyFilter === 'public'}
              onCheckedChange={() => setPrivacyFilter('public')}
            >
              {t('crd.spaces.filterPublicOnly')}
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={privacyFilter === 'private'}
              onCheckedChange={() => setPrivacyFilter('private')}
            >
              {t('crd.spaces.filterPrivateOnly')}
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator />

            {/* Type section (client-side) */}
            <DropdownMenuLabel
              style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-foreground)' }}
            >
              {t('crd.spaces.filterType')}
            </DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={typeFilter === 'all'}
              onCheckedChange={() => setTypeFilter('all')}
            >
              {t('crd.spaces.filterAllTypes')}
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={typeFilter === 'spaces'}
              onCheckedChange={() => setTypeFilter('spaces')}
            >
              {t('crd.spaces.filterSpacesOnly')}
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={typeFilter === 'subspaces'}
              onCheckedChange={() => setTypeFilter('subspaces')}
            >
              {t('crd.spaces.filterSubspacesOnly')}
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
                    <X style={{ width: 12, height: 12 }} />
                    {t('crd.spaces.clearFilters')}
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
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer"
              style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '999px' }}
              onClick={() => setPrivacyFilter('all')}
            >
              {privacyFilter === 'public' ? t('crd.spaces.filterPublicOnly') : t('crd.spaces.filterPrivateOnly')}
              <X style={{ width: 10, height: 10 }} />
            </Badge>
          )}
          {typeFilter !== 'all' && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer"
              style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '999px' }}
              onClick={() => setTypeFilter('all')}
            >
              {typeFilter === 'spaces' ? t('crd.spaces.filterSpacesOnly') : t('crd.spaces.filterSubspacesOnly')}
              <X style={{ width: 10, height: 10 }} />
            </Badge>
          )}
        </div>
      )}

      {/* Results count */}
      {!showSkeletons && displayedSpaces.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            {t('crd.spaces.showing')}{' '}
            <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{displayedSpaces.length}</span>{' '}
            {t('crd.spaces.of')}{' '}
            <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{spaces.length}</span>{' '}
            {t('crd.spaces.spacesLabel')}
          </p>
        </div>
      )}

      {/* Loading search indicator */}
      {loadingSearchResults && (
        <div className="flex items-center justify-center py-8">
          <div
            className="animate-spin rounded-full border-2 border-t-transparent"
            style={{ width: 24, height: 24, borderColor: 'var(--border)', borderTopColor: 'transparent' }}
          />
        </div>
      )}

      {/* Cards grid */}
      {showSkeletons ? (
        <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <SpaceCardSkeleton key={i} />
          ))}
        </div>
      ) : displayedSpaces.length > 0 ? (
        <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {displayedSpaces.map(space => (
            <SpaceCard key={space.id} space={space} onParentClick={onParentClick} />
          ))}
        </div>
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
          <FolderOpen style={{ width: 40, height: 40, color: 'var(--muted-foreground)', opacity: 0.5, marginBottom: 12 }} />
          <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
            {t('crd.spaces.emptyTitle')}
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)', maxWidth: 360, lineHeight: 1.5 }}>
            {t('crd.spaces.emptyMessage')}
          </p>
          {activeFilterCount > 0 && (
            <Button variant="outline" onClick={clearFilters} className="gap-2" style={{ fontSize: 'var(--text-sm)' }}>
              <X style={{ width: 14, height: 14 }} />
              {t('crd.spaces.clearFilters')}
            </Button>
          )}
        </div>
      )}

      {/* Load More */}
      {hasMore && displayedSpaces.length > 0 && !loading && (
        <div className="flex justify-center mt-8">
          <Button variant="outline" onClick={handleLoadMore} disabled={loadingMore} className="gap-2">
            {loadingMore ? (
              <div
                className="animate-spin rounded-full border-2 border-t-transparent"
                style={{ width: 16, height: 16, borderColor: 'currentColor', borderTopColor: 'transparent' }}
              />
            ) : (
              <ChevronDown style={{ width: 16, height: 16 }} />
            )}
            {t('crd.spaces.loadMore')}
          </Button>
        </div>
      )}
    </div>
  );
}
