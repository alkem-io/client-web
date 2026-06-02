import { debounce } from 'lodash-es';
import { useEffect, useRef, useState } from 'react';
import {
  useInnovationLibraryPacksPaginatedQuery,
  useInnovationLibraryTemplatesPaginatedQuery,
  useTemplateContentLazyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import type {
  LibraryInnovationPacksFilterInput,
  LibraryTemplatesFilterInput,
} from '@/core/apollo/generated/graphql-schema';
import type { TemplateTypeFilterValue } from '@/crd/components/innovationLibrary/TemplateTypeFilter';
import type { InnovationPackCardData } from '@/crd/components/innovationPack/types';
import type { TemplateCardData, TemplateContent } from '@/crd/components/templates/types';
import { mapTemplateToCardData, toGqlTemplateType } from '@/main/crdPages/templates/templateCardMapper';
import { mapTemplateContent, templateContentIncludeVars } from '@/main/crdPages/templates/templateContentMapper';
import { mapPackToInnovationPackCardData } from './innovationLibraryMapper';

/** Client page size — 3 rows of 5 cards on big screens (server caps at 100); FR-012. */
const PAGE_SIZE = 15;

/** Pause after the last keystroke before a search request fires (FR-018). */
const SEARCH_DEBOUNCE_MS = 300;

export type UseInnovationLibraryResult = {
  // templates
  templates: TemplateCardData[];
  templatesTotal: number;
  templatesLoading: boolean;
  loadingMoreTemplates: boolean;
  hasMoreTemplates: boolean;
  onLoadMoreTemplates: () => Promise<void>;

  // packs
  packs: InnovationPackCardData[];
  packsTotal: number;
  packsLoading: boolean;
  loadingMorePacks: boolean;
  hasMorePacks: boolean;
  onLoadMorePacks: () => Promise<void>;

  // type filter (server-side)
  activeTypeFilter: TemplateTypeFilterValue;
  onChangeTypeFilter: (next: TemplateTypeFilterValue) => void;

  // text search (server-side; debounced; per section)
  templatesSearch: string;
  onChangeTemplatesSearch: (next: string) => void;
  packsSearch: string;
  onChangePacksSearch: (next: string) => void;

  // preview (unchanged)
  onTemplatePreview: (templateId: string) => void;
  previewTemplate: TemplateCardData | undefined;
  previewContent: TemplateContent | undefined;
  previewLoading: boolean;
  closePreview: () => void;
};

/** Trim a raw search input to a server term, or `undefined` when blank/whitespace (FR-017). */
function toSearchTerm(raw: string): string | undefined {
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * CRD type filter + search term → server `LibraryTemplatesFilterInput`.
 * `'all'` types ⇒ no `types`; blank term ⇒ no `searchTerm`; both empty ⇒ no filter at all.
 */
function toTemplatesFilter(value: TemplateTypeFilterValue, search: string): LibraryTemplatesFilterInput | undefined {
  const types = value === 'all' ? undefined : value.map(toGqlTemplateType);
  const searchTerm = toSearchTerm(search);
  if (!types && !searchTerm) {
    return undefined;
  }
  return { ...(types ? { types } : {}), ...(searchTerm ? { searchTerm } : {}) };
}

/** Search term → server packs filter; `undefined` when blank. */
function toPacksFilter(search: string): LibraryInnovationPacksFilterInput | undefined {
  const searchTerm = toSearchTerm(search);
  return searchTerm ? { searchTerm } : undefined;
}

/**
 * `/innovation-library` page data. Two cursor-paginated queries (templates + packs),
 * forward-only `first`/`after` via `fetchMore`, server-side type filter, per-section
 * totals + `hasMore`, and silent stale-cursor recovery (a `fetchMore` rejection resets
 * that section to its first page). Selecting a card lazily fetches the matching template
 * content for the preview dialog the page mounts.
 */
export function useInnovationLibrary(): UseInnovationLibraryResult {
  const [filter, setFilter] = useState<TemplateTypeFilterValue>('all');
  // Raw terms drive the inputs (immediate); the debounced terms drive the queries (FR-018).
  const [templatesSearch, setTemplatesSearch] = useState('');
  const [packsSearch, setPacksSearch] = useState('');
  const [debouncedTemplatesSearch, setDebouncedTemplatesSearch] = useState('');
  const [debouncedPacksSearch, setDebouncedPacksSearch] = useState('');

  // The debounced target is a stable `useState` setter, so a ref-held lodash debounce never goes
  // stale; cancel any pending trailing call on unmount so it can't set state after teardown.
  const debounceTemplatesSearch = useRef(debounce(setDebouncedTemplatesSearch, SEARCH_DEBOUNCE_MS)).current;
  const debouncePacksSearch = useRef(debounce(setDebouncedPacksSearch, SEARCH_DEBOUNCE_MS)).current;
  useEffect(
    () => () => {
      debounceTemplatesSearch.cancel();
      debouncePacksSearch.cancel();
    },
    [debounceTemplatesSearch, debouncePacksSearch]
  );

  const onChangeTemplatesSearch = (next: string) => {
    setTemplatesSearch(next);
    debounceTemplatesSearch(next);
  };
  const onChangePacksSearch = (next: string) => {
    setPacksSearch(next);
    debouncePacksSearch(next);
  };

  const [loadingMoreTemplates, setLoadingMoreTemplates] = useState(false);
  const [loadingMorePacks, setLoadingMorePacks] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateCardData | undefined>(undefined);
  const [previewContent, setPreviewContent] = useState<TemplateContent | undefined>(undefined);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [getTemplateContent] = useTemplateContentLazyQuery();

  // --- Templates (server-side filter; cache keys on `filter`, so a filter change serves a fresh first page) ---
  const {
    data: templatesData,
    loading: templatesLoading,
    fetchMore: fetchMoreTemplatesRaw,
    refetch: refetchTemplates,
  } = useInnovationLibraryTemplatesPaginatedQuery({
    variables: { first: PAGE_SIZE, filter: toTemplatesFilter(filter, debouncedTemplatesSearch) },
  });

  const templatesConnection = templatesData?.platform.library.templatesPaginated;
  const templatesPageInfo = templatesConnection?.pageInfo;
  const templates: TemplateCardData[] = (templatesConnection?.templateResults ?? []).map(row => {
    const providerName = row.innovationPack.provider?.profile?.displayName;
    const packName = row.innovationPack.profile.displayName;
    return mapTemplateToCardData(row.template, providerName ?? packName);
  });

  const onLoadMoreTemplates = async () => {
    const endCursor = templatesPageInfo?.endCursor;
    if (!endCursor || loadingMoreTemplates) {
      return;
    }
    setLoadingMoreTemplates(true);
    try {
      await fetchMoreTemplatesRaw({ variables: { first: PAGE_SIZE, after: endCursor } });
    } catch {
      // Stale/invalid cursor (server throws when `after` no longer resolves) — silently
      // reset this section to its first page with fresh cursors rather than erroring (FR-014).
      await refetchTemplates();
    } finally {
      setLoadingMoreTemplates(false);
    }
  };

  // --- Packs ---
  const {
    data: packsData,
    loading: packsLoading,
    fetchMore: fetchMorePacksRaw,
    refetch: refetchPacks,
  } = useInnovationLibraryPacksPaginatedQuery({
    variables: { first: PAGE_SIZE, filter: toPacksFilter(debouncedPacksSearch) },
  });

  const packsConnection = packsData?.platform.library.innovationPacksPaginated;
  const packsPageInfo = packsConnection?.pageInfo;
  const packs: InnovationPackCardData[] = (packsConnection?.innovationPacks ?? []).map(mapPackToInnovationPackCardData);

  const onLoadMorePacks = async () => {
    const endCursor = packsPageInfo?.endCursor;
    if (!endCursor || loadingMorePacks) {
      return;
    }
    setLoadingMorePacks(true);
    try {
      await fetchMorePacksRaw({ variables: { first: PAGE_SIZE, after: endCursor } });
    } catch {
      await refetchPacks();
    } finally {
      setLoadingMorePacks(false);
    }
  };

  // --- Preview (unchanged behaviour; finds the card among the loaded templates) ---
  const onTemplatePreview = (templateId: string) => {
    const card = templates.find(t => t.id === templateId);
    if (!card) return;
    setPreviewTemplate(card);
    setPreviewContent(undefined);
    setPreviewLoading(true);
    void getTemplateContent({
      variables: { templateId, ...templateContentIncludeVars(card.type) },
    })
      .then(({ data: tData }) => {
        const fetched = tData?.lookup.template;
        if (fetched) {
          setPreviewContent(mapTemplateContent(fetched, card.type));
        }
      })
      .catch(() => {
        // Network / auth error — close the preview so the user can retry, rather than leaving the
        // dialog open with no content and no signal of what went wrong.
        setPreviewTemplate(undefined);
      })
      .finally(() => setPreviewLoading(false));
  };

  const closePreview = () => {
    setPreviewTemplate(undefined);
    setPreviewContent(undefined);
  };

  return {
    templates,
    templatesTotal: templatesConnection?.total ?? 0,
    templatesLoading,
    loadingMoreTemplates,
    hasMoreTemplates: templatesPageInfo?.hasNextPage ?? false,
    onLoadMoreTemplates,

    packs,
    packsTotal: packsConnection?.total ?? 0,
    packsLoading,
    loadingMorePacks,
    hasMorePacks: packsPageInfo?.hasNextPage ?? false,
    onLoadMorePacks,

    activeTypeFilter: filter,
    onChangeTypeFilter: setFilter,

    templatesSearch,
    onChangeTemplatesSearch,
    packsSearch,
    onChangePacksSearch,

    onTemplatePreview,
    previewTemplate,
    previewContent,
    previewLoading,
    closePreview,
  };
}
