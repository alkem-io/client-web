import { ChevronDown, FolderOpen, Search, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SpaceCard, type SpaceCardData, SpaceCardSkeleton } from '@/crd/components/space/SpaceCard';
import { snapToFullRows, useGridColumnCount } from '@/crd/hooks/useGridColumnCount';
import { Button } from '@/crd/primitives/button';

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

const matchesQuery = (space: SpaceCardData, query: string) => {
  const needle = query.trim().toLowerCase();
  if (needle === '') return true;
  const haystack = `${space.name} ${space.description} ${space.tags.join(' ')}`.toLowerCase();
  return haystack.includes(needle);
};

export function HubSpacesSection({ spaces, hubName, spacesLoading = false }: HubSpacesSectionProps) {
  const { t } = useTranslation(['crd-innovationHub', 'crd-common']);

  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

  const gridRef = useRef<HTMLUListElement>(null);
  const columnCount = useGridColumnCount(gridRef);

  const hasSearch = query.trim().length > 0;
  const filtered = hasSearch ? spaces.filter(space => matchesQuery(space, query)) : spaces;

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

  const handleLoadMore = () => {
    setVisibleCount(count => count + BATCH_SIZE);
  };

  const clearSearch = () => {
    setQuery('');
    setVisibleCount(BATCH_SIZE);
  };

  const showLoadingSkeletons = spacesLoading && spaces.length === 0;
  const showEmptyHub = !spacesLoading && spaces.length === 0;
  const showSearchBox = spaces.length > 0;
  const showNoResults = hasSearch && filtered.length === 0;

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
            <div className="mb-6">
              <div className="relative">
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
              <Button variant="outline" onClick={clearSearch} className="gap-2">
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
