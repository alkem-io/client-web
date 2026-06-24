import { ChevronDown, FolderOpen, Search, SlidersHorizontal, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SpaceCard, type SpaceCardData, SpaceCardSkeleton } from '@/crd/components/space/SpaceCard';
import { snapToFullRows, useGridColumnCount } from '@/crd/hooks/useGridColumnCount';
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

export type HubSpacesSectionProps = {
  /** The hub's full, ordered Space cards — already filtered to the hub's own set by the integration layer. */
  spaces: SpaceCardData[];
  /** The hub display name, used in the section title. */
  hubName: string;
  /** True while the hub's Spaces query is in flight (the hub itself has already resolved). */
  spacesLoading?: boolean;
};

/** Initial and "Load more" increment, matching the prototype's hub demo. */
const BATCH_SIZE = 12;

const SKELETON_COUNT = 6;

const GRID_CLASS = 'grid gap-6 list-none p-0 m-0 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]';

const filterLabelClassName = 'text-badge uppercase tracking-[0.08em] text-muted-foreground';

type PrivacyFilter = 'all' | 'public' | 'private';

const matchesPrivacy = (space: SpaceCardData, filter: PrivacyFilter) => {
  if (filter === 'public') return !space.isPrivate;
  if (filter === 'private') return space.isPrivate;
  return true;
};

const matchesQuery = (space: SpaceCardData, query: string) => {
  const needle = query.trim().toLowerCase();
  if (needle === '') return true;
  const haystack = `${space.name} ${space.description} ${space.tags.join(' ')}`.toLowerCase();
  return haystack.includes(needle);
};

export function HubSpacesSection({ spaces, hubName, spacesLoading = false }: HubSpacesSectionProps) {
  const { t } = useTranslation(['crd-innovationHub', 'crd-common']);

  const [query, setQuery] = useState('');
  const [privacyFilter, setPrivacyFilter] = useState<PrivacyFilter>('all');
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

  const gridRef = useRef<HTMLUListElement>(null);
  const columnCount = useGridColumnCount(gridRef);

  const hasSearch = query.trim().length > 0;
  const hasPrivacyFilter = privacyFilter !== 'all';
  const isFiltered = hasSearch || hasPrivacyFilter;
  const filtered = isFiltered
    ? spaces.filter(space => matchesQuery(space, query) && matchesPrivacy(space, privacyFilter))
    : spaces;

  // While more cards remain to load, only render whole rows so the row above the
  // "Load more" button is never partial. Once everything fits, the final partial
  // row is allowed to show.
  const renderCount = snapToFullRows(visibleCount, filtered.length, columnCount);
  const displayed = filtered.slice(0, renderCount);
  const hasMore = displayed.length < filtered.length;

  const handleSearchChange = (next: string) => {
    setQuery(next);
    setVisibleCount(BATCH_SIZE);
  };

  const handlePrivacyChange = (next: PrivacyFilter) => {
    setPrivacyFilter(next);
    setVisibleCount(BATCH_SIZE);
  };

  const handleLoadMore = () => {
    setVisibleCount(count => count + BATCH_SIZE);
  };

  const clearSearch = () => {
    setQuery('');
    setVisibleCount(BATCH_SIZE);
  };

  const clearAllFilters = () => {
    setQuery('');
    setPrivacyFilter('all');
    setVisibleCount(BATCH_SIZE);
  };

  const showLoadingSkeletons = spacesLoading && spaces.length === 0;
  const showEmptyHub = !spacesLoading && spaces.length === 0;
  const showSearchBox = spaces.length > 0;
  const showNoResults = isFiltered && filtered.length === 0;

  return (
    <section>
      <h2 className="text-section-title mb-6 text-foreground">{t('home.spacesSection.title', { hubName })}</h2>

      {showLoadingSkeletons ? (
        <output aria-label={t('home.spacesSection.loading')} className={GRID_CLASS}>
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders have no stable key
            <SpaceCardSkeleton key={i} />
          ))}
        </output>
      ) : showEmptyHub ? (
        <div className="rounded-lg border border-border bg-card/50 p-8 text-center text-muted-foreground">
          <p className="text-body">{t('home.spacesSection.empty')}</p>
        </div>
      ) : (
        <>
          {showSearchBox && (
            <div className="mb-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
                />
                <input
                  type="search"
                  value={query}
                  onChange={event => handleSearchChange(event.target.value)}
                  placeholder={t('home.spacesSection.searchPlaceholder')}
                  aria-label={t('home.spacesSection.searchPlaceholder')}
                  className="w-full h-10 pl-9 pr-9 border border-border bg-background rounded-lg text-body text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary"
                />
                {hasSearch && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    aria-label={t('home.spacesSection.clearSearch')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center size-6 rounded-md text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <X aria-hidden="true" className="size-4" />
                  </button>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild={true}>
                  <Button
                    variant="outline"
                    className={cn(
                      'gap-2 h-10 rounded-lg',
                      hasPrivacyFilter ? 'text-primary border-primary' : 'text-foreground border-border'
                    )}
                  >
                    <SlidersHorizontal aria-hidden="true" className="size-3.5" />
                    {t('home.spacesSection.filters')}
                    {hasPrivacyFilter && (
                      <Badge className="text-badge px-[5px] h-[18px] bg-primary text-primary-foreground rounded-full ml-0.5">
                        1
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[200px]">
                  <DropdownMenuLabel className={filterLabelClassName}>
                    {t('home.spacesSection.filterPrivacy')}
                  </DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={privacyFilter === 'all'}
                    onCheckedChange={() => handlePrivacyChange('all')}
                  >
                    {t('home.spacesSection.filterAll')}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={privacyFilter === 'public'}
                    onCheckedChange={() => handlePrivacyChange('public')}
                  >
                    {t('home.spacesSection.filterPublicOnly')}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={privacyFilter === 'private'}
                    onCheckedChange={() => handlePrivacyChange('private')}
                  >
                    {t('home.spacesSection.filterPrivateOnly')}
                  </DropdownMenuCheckboxItem>

                  {hasPrivacyFilter && (
                    <>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePrivacyChange('all')}
                          className="w-full justify-start gap-2 text-destructive h-8"
                        >
                          <X aria-hidden="true" className="size-3" />
                          {t('home.spacesSection.clearFilters')}
                        </Button>
                      </div>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {hasPrivacyFilter && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => handlePrivacyChange('all')}
                className="inline-flex items-center gap-1 cursor-pointer rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 text-caption px-2.5 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {privacyFilter === 'public'
                  ? t('home.spacesSection.filterPublicOnly')
                  : t('home.spacesSection.filterPrivateOnly')}
                <X aria-hidden="true" className="size-2.5" />
                <span className="sr-only">, {t('home.spacesSection.removeFilter')}</span>
              </button>
            </div>
          )}

          {displayed.length > 0 && (
            <div className="mb-4">
              <p className="text-body text-muted-foreground">
                {t('home.spacesSection.showing')}{' '}
                <span className="text-body-emphasis text-foreground">{filtered.length}</span>{' '}
                {t('home.spacesSection.spacesLabel')}
              </p>
            </div>
          )}

          {displayed.length > 0 && (
            // biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight strips list semantics from a grid <ul>; the role restores them
            // biome-ignore lint/a11y/useSemanticElements: the <ul> IS the semantic element — the role is reaffirming, not substituting
            <ul ref={gridRef} role="list" className={GRID_CLASS} aria-label={t('home.spacesSection.spacesLabel')}>
              {displayed.map(space => (
                <li key={space.id}>
                  <SpaceCard space={space} />
                </li>
              ))}
            </ul>
          )}

          {showNoResults && (
            <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-dashed border-border rounded-xl bg-muted">
              <FolderOpen aria-hidden="true" className="size-10 text-muted-foreground opacity-50 mb-3" />
              <h3 className="text-subsection-title mb-1 text-foreground">{t('home.spacesSection.noResultsTitle')}</h3>
              <p className="text-body text-muted-foreground max-w-[360px] mb-4">
                {t('home.spacesSection.noResultsMessage')}
              </p>
              <Button variant="outline" onClick={clearAllFilters} className="gap-2">
                <X aria-hidden="true" className="size-3.5" />
                {t('home.spacesSection.clearSearch')}
              </Button>
            </div>
          )}

          {hasMore && (
            <div className="flex justify-center mt-8">
              <Button variant="outline" onClick={handleLoadMore} className="gap-2">
                <ChevronDown aria-hidden="true" className="size-4" />
                {t('crd-common:loadMore')}
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
