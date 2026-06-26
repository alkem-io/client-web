import { ChevronLeft, ChevronRight, List, Loader2, Map as MapIcon, Search, Users } from 'lucide-react';
import { type ComponentType, lazy, Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ContributorMapPin } from '@/crd/components/map/ContributorMap';
import { cn } from '@/crd/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/crd/primitives/tabs';
import { ContributorCard, type ContributorCardData } from './ContributorCard';

/**
 * Contributor-collection callout body (feature 008): segmented type switch
 * (FR-009a), client-side name search scoped to the active type (FR-008),
 * always-visible per-type counts (FR-013/FR-014), client-paginated list
 * (FR-012a — 9/page, mirroring the community block) and a lazy map view
 * (FR-010/FR-012b). Purely presentational — data + lazy fetching live in the
 * consumer (`useCrdSpaceContributors`); the only behaviour here is visual state
 * (active type, search text, page, view mode) plus prop callbacks.
 */

// The map renderer (and `maplibre-gl`) is lazy-loaded so the WebGL bundle stays
// out of the main chunk; it downloads only when a viewer first opens the map.
const ContributorMap = lazy(() => import('@/crd/components/map/ContributorMap'));

export type ContributorTypeId = 'user' | 'organization' | 'virtualContributor';
export type ContributorViewId = 'list' | 'map';

export type ContributorCollectionCounts = {
  users: number;
  organizations: number;
  virtualContributors: number;
};

/** Mirrors the existing community block's page size (`SpaceMembers`, 9/page). */
const PAGE_SIZE = 9;

const COUNT_BY_TYPE: Record<ContributorTypeId, keyof ContributorCollectionCounts> = {
  user: 'users',
  organization: 'organizations',
  virtualContributor: 'virtualContributors',
};

const isLocatable = (type: ContributorTypeId): boolean => type !== 'virtualContributor';

type ContributorCollectionProps = {
  /** Selected types in display order (>=1). */
  types: ContributorTypeId[];
  /** Active type (controlled by the consumer so it can lazy-fetch on change). */
  activeType: ContributorTypeId;
  onActiveTypeChange: (type: ContributorTypeId) => void;
  /** Default display, used to initialise the view toggle. */
  defaultView: ContributorViewId;
  /** Always-visible per-type counts (total eligible set; stable while searching). */
  counts: ContributorCollectionCounts;
  /** Cards for the active type, or `undefined` while loading. */
  cards: ContributorCardData[] | undefined;
  /** Whether the active type's set is currently loading. */
  loading: boolean;
  onContributorClick?: (href: string) => void;
  className?: string;
};

export function ContributorCollection({
  types,
  activeType,
  onActiveTypeChange,
  defaultView,
  counts,
  cards,
  loading,
  onContributorClick,
  className,
}: ContributorCollectionProps) {
  const { t } = useTranslation('crd-space');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  // The view follows the configured `defaultView` until the user explicitly
  // toggles it (FR-010). Tracking an override — rather than seeding useState from
  // `defaultView` — means a `defaultView` that resolves asynchronously (the config
  // loads after first render) still takes effect, instead of being captured stale.
  const [viewOverride, setViewOverride] = useState<ContributorViewId | null>(null);
  const view = viewOverride ?? defaultView;

  const showMapControl = isLocatable(activeType);
  // Auto-heal to list on the VC segment (the map control is hidden there — FR-010).
  const effectiveView: ContributorViewId = showMapControl ? view : 'list';

  // Client-side name search (case-insensitive substring on display name),
  // scoped to the active type's fetched set (FR-008). Counts are NOT affected.
  const allCards = cards ?? [];
  const query = search.trim().toLowerCase();
  const filtered = query ? allCards.filter(c => c.name.toLowerCase().includes(query)) : allCards;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageCards = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const handleTypeChange = (type: ContributorTypeId) => {
    onActiveTypeChange(type);
    setSearch('');
    setPage(0);
  };

  const countFor = (type: ContributorTypeId): number => counts[COUNT_BY_TYPE[type]];

  const typeLabel = (type: ContributorTypeId): string => t(`contributors.types.${type}` as 'contributors.types.user');

  // Map pins: only the located subset of the (search-filtered) active set.
  const pins: ContributorMapPin[] = filtered
    .filter(c => c.hasValidCoordinates && c.latitude != null && c.longitude != null)
    .map(c => ({
      id: c.id,
      name: c.name,
      avatarUrl: c.avatarUrl,
      roleLabel: c.roleLabel,
      href: c.href,
      latitude: c.latitude as number,
      longitude: c.longitude as number,
    }));
  const unlocated = filtered.filter(c => !c.hasValidCoordinates);

  return (
    <section className={cn('space-y-4', className)} aria-label={t('contributors.title')}>
      {/* Segmented type switch — shown only when >1 type (FR-009a). Counts are
          always visible on each segment. */}
      {types.length > 1 && (
        <Tabs value={activeType} onValueChange={v => handleTypeChange(v as ContributorTypeId)}>
          <TabsList>
            {types.map(type => (
              <TabsTrigger key={type} value={type}>
                <span>{typeLabel(type)}</span>
                <span className="ml-1.5 rounded-full bg-background/60 px-1.5 text-caption text-muted-foreground">
                  {countFor(type)}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Search + view toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder={t('contributors.search')}
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(0);
            }}
            aria-label={t('contributors.search')}
            className="w-full h-10 pl-9 pr-4 border border-border bg-background rounded-lg text-body text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary"
          />
        </div>

        {/* List/Map control — hidden on the VC segment (list-only, FR-010). */}
        {showMapControl && (
          <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
            <ViewButton
              active={effectiveView === 'list'}
              onClick={() => setViewOverride('list')}
              icon={List}
              label={t('contributors.viewList')}
            />
            <ViewButton
              active={effectiveView === 'map'}
              onClick={() => setViewOverride('map')}
              icon={MapIcon}
              label={t('contributors.viewMap')}
            />
          </div>
        )}
      </div>

      {/* Single per-type count line (always visible, total eligible set). */}
      <p className="text-caption text-muted-foreground" aria-live="off">
        {t(`contributors.counts.${COUNT_BY_TYPE[activeType]}` as 'contributors.counts.users', {
          count: countFor(activeType),
        })}
      </p>

      {loading && cards === undefined ? (
        <output className="flex items-center justify-center py-12" aria-label={t('contributors.title')}>
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </output>
      ) : effectiveView === 'map' ? (
        <div className="space-y-4">
          <Suspense
            fallback={
              <div className="flex h-96 items-center justify-center rounded-lg border border-border">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <ContributorMap pins={pins} ariaLabel={t('contributors.viewMap')} onPinClick={onContributorClick} />
          </Suspense>
          {/* Contributors without precise coordinates — listed beneath the map (FR-012). */}
          {unlocated.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-label text-muted-foreground uppercase">{t('contributors.noLocationData')}</h3>
              <p className="text-caption text-muted-foreground">{t('contributors.noLocationDescription')}</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {unlocated.map(c => (
                  <li key={c.id}>
                    <ContributorCard contributor={c} onContributorClick={onContributorClick} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState searching={query.length > 0} />
      ) : (
        <>
          <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pageCards.map(c => (
              <li key={c.id}>
                <ContributorCard contributor={c} onContributorClick={onContributorClick} />
              </li>
            ))}
          </ul>
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-4">
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={safePage === 0}
                aria-label={t('members.previousPage')}
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>
              <span className="mx-2 text-body text-muted-foreground">
                {t('members.pageOf', { current: safePage + 1, total: totalPages })}
              </span>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={safePage >= totalPages - 1}
                aria-label={t('members.nextPage')}
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function ViewButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-control font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <Icon className="w-4 h-4" aria-hidden={true} />
      <span>{label}</span>
    </button>
  );
}

function EmptyState({ searching }: { searching: boolean }) {
  const { t } = useTranslation('crd-space');
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-muted">
        <Users className="w-6 h-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <p className="text-body text-muted-foreground">
        {searching ? t('contributors.emptySearch') : t('contributors.empty')}
      </p>
    </div>
  );
}
