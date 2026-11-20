import { useState } from 'react';
import { useCalloutsSetTagsQuery } from '@/core/apollo/generated/apollo-hooks';
import type { TagsetArgs } from '@/core/apollo/generated/graphql-schema';
import type { FlowStateSearchStatus } from '@/crd/components/search/FlowStateSearchResults';
import type { SearchSectionProps } from '@/crd/components/space/sidebar/SearchSection';
import { useDebouncedValue } from '@/main/crdPages/utils/useDebouncedValue';
import { buildFlowStateSearchTerms, mapFlowStateSearchCalloutIds } from '../dataMappers/flowStateSearchDataMapper';
import { useFlowStateSearch } from './useFlowStateSearch';

/** Debounce window between a keystroke and the search it drives. */
const SEARCH_DEBOUNCE_MS = 300;
const isEmptySearchText = (text: string) => text === '';

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
  /** The callouts set the tag chips are read from; the tags query waits for it. */
  calloutsSetId: string | undefined;
  /** The classification that narrows the tag chips to the searched flow state. */
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
  calloutsSetId,
  classificationTagsets,
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
  const { data: tagsData, loading: tagsLoading } = useCalloutsSetTagsQuery({
    variables: {
      // biome-ignore lint/style/noNonNullAssertion: ensured by skip
      calloutsSetId: calloutsSetId!,
      classificationTagsets,
    },
    skip: !enabled || !calloutsSetId,
  });
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
      allTags: tagsData?.lookup.calloutsSet?.tags ?? [],
      tagsLoading,
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
