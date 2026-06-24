import { ChevronDown, FolderOpen, Search, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SpaceCard, type SpaceCardData, SpaceCardSkeleton } from '@/crd/components/space/SpaceCard';
import { TagsInput } from '@/crd/forms/tags-input';
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

const matchesAllTerms = (space: SpaceCardData, terms: string[]) => {
  const haystack = `${space.name} ${space.description} ${space.tags.join(' ')}`.toLowerCase();
  return terms.every(term => {
    const needle = term.trim().toLowerCase();
    return needle === '' || haystack.includes(needle);
  });
};

export function HubSpacesSection({ spaces, hubName, spacesLoading = false }: HubSpacesSectionProps) {
  const { t } = useTranslation(['crd-innovationHub', 'crd-common']);

  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

  const hasSearch = searchTerms.length > 0;
  const filtered = hasSearch ? spaces.filter(space => matchesAllTerms(space, searchTerms)) : spaces;
  const displayed = filtered.slice(0, visibleCount);
  const hasMore = displayed.length < filtered.length;

  const handleSearchChange = (terms: string[]) => {
    setSearchTerms(terms);
    setVisibleCount(BATCH_SIZE);
  };

  const handleLoadMore = () => {
    setVisibleCount(count => count + BATCH_SIZE);
  };

  const clearSearch = () => {
    setSearchTerms([]);
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
              <TagsInput
                value={searchTerms}
                onChange={handleSearchChange}
                placeholder={t('home.spacesSection.searchPlaceholder')}
                icon={<Search aria-hidden="true" className="shrink-0 size-4 text-muted-foreground" />}
              />
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
            <ul role="list" className={GRID_CLASS} aria-label={t('home.spacesSection.spacesLabel')}>
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
