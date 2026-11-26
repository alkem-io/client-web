import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TagsetArgs } from '@/core/apollo/generated/graphql-schema';
import { useNotification } from '@/core/ui/notifications/useNotification';
import type { FlowStateSearchStatus } from '@/crd/components/search/FlowStateSearchResults';
import type { SearchSectionProps } from '@/crd/components/space/sidebar/SearchSection';
import { useDebouncedValue } from '@/main/crdPages/utils/useDebouncedValue';
import { buildFlowStateSearchTerms, mapFlowStateSearchCalloutIds } from '../dataMappers/flowStateSearchDataMapper';
import { useFlowStateSearch } from './useFlowStateSearch';

/** Debounce window between a keystroke and the search it drives. */
const SEARCH_DEBOUNCE_MS = 300;
const isEmptySearchText = (text: string) => text === '';
const NO_TAGS: string[] = [];

export type UseSidebarFlowStateSearchParams = {
  /** True when the `search` widget is configured; nothing is fetched otherwise. */
  enabled: boolean;
  /**
   * The level-zero space id. Indexed callout documents carry the root space id, so a
   * subspace must pass its level-zero space here, never its own id.
   */
  spaceId: string | undefined;
  /** The flow state searched. A change of flow state clears the text and the tags. */
  flowStateId: string | undefined;
  /** Legacy's tag-query inputs, still passed by the pages; unread until WP-SRCH1 serves spaceTags. */
  calloutsSetId: string | undefined;
  classificationTagsets: TagsetArgs[] | undefined;
};

export type UseSidebarFlowStateSearchResult = {
  /** Props for the sidebar `SearchSection` widget. */
  section: SearchSectionProps;
  /** True while a filter is applied — the page then renders the results instead of the feed. */
  isSearching: boolean;
  status: FlowStateSearchStatus;
  appending: boolean;
  hasMore: boolean;
  sentinelRef: (node?: Element | null) => void;
  retry: () => void;
  /** The matched callout ids, in relevance order. */
  calloutIds: string[];
};

/**
 * State and data for the sidebar search widget. The page owns it because the sidebar
 * renders twice (desktop column and mobile drawer) while the results replace the feed.
 * The applied text and every selected tag are joined into exactly one term, which keeps
 * the request under the search service's term limit regardless of the tag count.
 */
export function useSidebarFlowStateSearch({
  enabled,
  spaceId,
  flowStateId,
}: UseSidebarFlowStateSearchParams): UseSidebarFlowStateSearchResult {
  const [searchedFlowStateId, setSearchedFlowStateId] = useState(flowStateId);
  const [text, setText] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  // A search never leaks across flow states.
  if (searchedFlowStateId !== flowStateId) {
    setSearchedFlowStateId(flowStateId);
    setText('');
    setTags([]);
  }
  // Clearing the field applies immediately — only a non-empty value waits out the
  // debounce, so a term typed right after a clear can never re-apply the cleared one.
  const appliedText = useDebouncedValue(text, SEARCH_DEBOUNCE_MS, { immediate: isEmptySearchText }).trim();
  // The tag chips' read is WP-SRCH1's spaceTags, not served yet (021 DEP-021-SEARCH): the chip row shows no chips and
  // the failure notification legacy raised for a failed tags read, once per searched flow state.
  const { t } = useTranslation();
  const notify = useNotification();
  useEffect(() => {
    if (enabled) notify(t('apollo.errors.generic'), 'error');
  }, [enabled, flowStateId]);
  const terms = buildFlowStateSearchTerms(appliedText, tags);
  const isSearching = enabled && terms.length > 0;
  const search = useFlowStateSearch({
    flowStateID: flowStateId,
    spaceID: spaceId,
    terms,
    skip: !isSearching,
  });
  const calloutIds = mapFlowStateSearchCalloutIds(search.results);

  return {
    section: {
      text,
      onTextChange: setText,
      appliedText,
      allTags: NO_TAGS,
      tagsLoading: false,
      selectedTags: tags,
      onToggleTag: (tag: string) =>
        setTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])),
      matchCount: search.status === 'results' || search.status === 'empty' ? calloutIds.length : undefined,
      hasMore: search.hasMore,
      onClear: () => {
        setText('');
        setTags([]);
      },
    },
    isSearching,
    status: search.status,
    appending: search.appending,
    hasMore: search.hasMore,
    sentinelRef: search.sentinelRef,
    retry: search.retry,
    calloutIds,
  };
}
