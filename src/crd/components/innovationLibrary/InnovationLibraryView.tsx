import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { InnovationPackCard } from '@/crd/components/innovationPack/InnovationPackCard';
import type { InnovationPackCardData } from '@/crd/components/innovationPack/types';
import type { TemplateCardData } from '@/crd/components/templates/types';
import { SearchField } from '@/crd/forms/SearchField';
import { Button } from '@/crd/primitives/button';
import { Skeleton } from '@/crd/primitives/skeleton';
import { TemplateGallery } from './TemplateGallery';
import { TemplateTypeFilter, type TemplateTypeFilterValue } from './TemplateTypeFilter';

export type InnovationLibraryViewProps = {
  /** Store-listed Innovation Packs — cards link to each pack's public profile via `pack.url`. */
  packs: InnovationPackCardData[];
  packsLoading?: boolean;
  /** Total listed packs in the collection (FR-003). */
  packsTotal: number;
  /** Whether a further page of packs exists — gates the Load-More control (FR-008). */
  hasMorePacks: boolean;
  /** Subsequent-page busy state (non-blocking; FR-011). */
  loadingMorePacks?: boolean;
  onLoadMorePacks: () => void;
  /** Raw packs search term (server-side; debounced by the consumer; FR-015). */
  packsSearch: string;
  onChangePacksSearch: (next: string) => void;
  /** Templates for the current (server-side) type filter, in server order (newest-first). */
  templates: TemplateCardData[];
  templatesLoading?: boolean;
  /** Total templates in the (optionally filtered) collection (FR-003). */
  templatesTotal: number;
  hasMoreTemplates: boolean;
  loadingMoreTemplates?: boolean;
  onLoadMoreTemplates: () => void;
  activeTypeFilter: TemplateTypeFilterValue;
  onChangeTypeFilter: (next: TemplateTypeFilterValue) => void;
  /** Raw templates search term (composes with the type filter server-side; FR-016). */
  templatesSearch: string;
  onChangeTemplatesSearch: (next: string) => void;
  onTemplatePreview: (templateId: string) => void;
};

const PACK_SKELETON_KEYS = ['p1', 'p2', 'p3', 'p4', 'p5'];

/**
 * Per-section footer: an "X of T" progress count plus a "Load More" button. The
 * count stays visible (reading "T of T") on the last page when the button is
 * hidden (FR-003/FR-008). Hidden entirely while the section is empty.
 */
function LoadMoreFooter({
  loaded,
  total,
  hasMore,
  loadingMore,
  onLoadMore,
}: {
  loaded: number;
  total: number;
  hasMore: boolean;
  loadingMore?: boolean;
  onLoadMore: () => void;
}) {
  const { t } = useTranslation(['crd-templates', 'crd-common']);
  if (loaded === 0) {
    return null;
  }
  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      <p className="text-caption text-muted-foreground" aria-live="polite">
        {t('crd-templates:library.loadedOfTotal', { loaded, total })}
      </p>
      {hasMore && (
        <Button variant="outline" onClick={onLoadMore} disabled={loadingMore} aria-busy={loadingMore} className="gap-2">
          {loadingMore ? (
            <div
              aria-hidden="true"
              className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
          ) : (
            <ChevronDown aria-hidden="true" className="size-4" />
          )}
          {t('crd-common:loadMore')}
        </Button>
      )}
    </div>
  );
}

/**
 * Innovation Library body — an Innovation Packs section + a type-filterable
 * Template Gallery, both cursor-paginated. The page (`CrdInnovationLibraryPage`)
 * wraps this with a heading and mounts the `TemplatePreviewDialog` itself.
 */
export function InnovationLibraryView({
  packs,
  packsLoading,
  packsTotal,
  hasMorePacks,
  loadingMorePacks,
  onLoadMorePacks,
  packsSearch,
  onChangePacksSearch,
  templates,
  templatesLoading,
  templatesTotal,
  hasMoreTemplates,
  loadingMoreTemplates,
  onLoadMoreTemplates,
  activeTypeFilter,
  onChangeTypeFilter,
  templatesSearch,
  onChangeTemplatesSearch,
  onTemplatePreview,
}: InnovationLibraryViewProps) {
  const { t } = useTranslation('crd-templates');

  return (
    <div className="space-y-10">
      <section aria-labelledby="crd-library-packs-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="crd-library-packs-heading" className="text-section-title">
            {t('library.packs.heading')}
          </h2>
          <SearchField
            value={packsSearch}
            onValueChange={onChangePacksSearch}
            placeholder={t('library.packs.searchPlaceholder')}
            className="w-full sm:w-64"
          />
        </div>
        {packsLoading ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {PACK_SKELETON_KEYS.map(key => (
              <li key={key}>
                <Skeleton className="h-72 w-full rounded-lg" />
              </li>
            ))}
          </ul>
        ) : packs.length === 0 ? (
          <p className="py-6 text-body text-muted-foreground">{t('library.packs.empty')}</p>
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {packs.map(pack => (
                <li key={pack.id}>
                  <InnovationPackCard pack={pack} />
                </li>
              ))}
            </ul>
            <LoadMoreFooter
              loaded={packs.length}
              total={packsTotal}
              hasMore={hasMorePacks}
              loadingMore={loadingMorePacks}
              onLoadMore={onLoadMorePacks}
            />
          </>
        )}
      </section>

      <section aria-labelledby="crd-library-templates-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="crd-library-templates-heading" className="text-section-title">
            {t('library.templates.heading')}
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <TemplateTypeFilter value={activeTypeFilter} onChange={onChangeTypeFilter} />
            <SearchField
              value={templatesSearch}
              onValueChange={onChangeTemplatesSearch}
              placeholder={t('library.templates.searchPlaceholder')}
              className="w-full sm:w-64"
            />
          </div>
        </div>
        <TemplateGallery
          templates={templates}
          loading={templatesLoading}
          onPreview={onTemplatePreview}
          emptyLabel={t('library.templates.empty')}
        />
        {!templatesLoading && (
          <LoadMoreFooter
            loaded={templates.length}
            total={templatesTotal}
            hasMore={hasMoreTemplates}
            loadingMore={loadingMoreTemplates}
            onLoadMore={onLoadMoreTemplates}
          />
        )}
      </section>
    </div>
  );
}
