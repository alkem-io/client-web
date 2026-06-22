import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCalloutsSetTagsQuery } from '@/core/apollo/generated/apollo-hooks';
import useNavigate from '@/core/routing/useNavigate';
import { FilterResultsSummary } from '@/crd/components/common/FilterResultsSummary';
import { TagFilterPopover } from '@/crd/components/common/TagFilterPopover';
import { FlowStateSearchResults } from '@/crd/components/search/FlowStateSearchResults';
import { SpaceSidebar } from '@/crd/components/space/SpaceSidebar';
import { FlowStateSearchField } from '@/crd/forms/FlowStateSearchField';
import { Button } from '@/crd/primitives/button';
import { classificationTagsetModelToTagsetArgs } from '@/domain/collaboration/calloutsSet/Classification/ClassificationTagset.utils';
import { useSpace } from '@/domain/space/context/useSpace';
import { mapCalloutsToListItems } from '@/main/crdPages/space/dataMappers/calloutDataMapper';
import { CalloutFormConnector } from '../callout/CalloutFormConnector';
import { CalloutListConnector } from '../callout/CalloutListConnector';
import { LazyCalloutItem } from '../callout/LazyCalloutItem';
import { mapFlowStateSearchCalloutIds } from '../dataMappers/flowStateSearchDataMapper';
import { useCrdCalloutList } from '../hooks/useCrdCalloutList';
import { useCrdSpaceLeads } from '../hooks/useCrdSpaceLeads';
import { useFlowStateSearch } from '../hooks/useFlowStateSearch';
import { SpaceSidebarPortal } from '../layout/SpaceSidebarPortal';
import { SpaceTabActionHeader } from '../layout/SpaceTabActionHeader';

type CrdSpaceCustomTabPageProps = {
  sectionIndex: number;
};

export default function CrdSpaceCustomTabPage({ sectionIndex }: CrdSpaceCustomTabPageProps) {
  const { t } = useTranslation('crd-space');
  const { space, permissions } = useSpace();
  const navigate = useNavigate();
  const sidebarLeads = useCrdSpaceLeads(space.id);
  const [tagsFilter, setTagsFilter] = useState<string[]>([]);
  // The free-text term, submitted on Enter (FR-010) — not live keystrokes.
  const [submittedTerm, setSubmittedTerm] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const {
    callouts,
    calloutsSetId,
    classificationTagsets,
    canCreateCallout,
    canReorderCallouts,
    tabDescription,
    flowStateForNewCallouts,
    loading,
  } = useCrdCalloutList({ tabPosition: sectionIndex });

  // The current tab IS a flow state; its UUID scopes the search (FR-008/012).
  // Generic to any L0 flow-state tab — no KB-specific branch (FR-011).
  const flowStateId = flowStateForNewCallouts?.id;

  // Faceted tag source: the flow state's already-loaded tag universe (T017 / FR-004).
  // No new endpoint — the same query the board uses for its tag filter.
  const { data: tagsData } = useCalloutsSetTagsQuery({
    variables: {
      // biome-ignore lint/style/noNonNullAssertion: ensured by skip
      calloutsSetId: calloutsSetId!,
      classificationTagsets: classificationTagsetModelToTagsetArgs(classificationTagsets),
    },
    skip: !calloutsSetId,
  });
  const allTags = tagsData?.lookup.calloutsSet?.tags ?? [];

  const handleToggleTag = (tag: string) => {
    setTagsFilter(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
  };

  // Active search = a submitted term or one+ selected tag pills. Selecting a tag
  // is an active search, not browse (FR-018). Tag pills ride the `terms` array
  // (FR-004): each selected pill is appended; multi-tag OR comes from term
  // semantics. The free-text term is split into words and appended too.
  const termWords = submittedTerm.trim().length > 0 ? submittedTerm.trim().split(/\s+/) : [];
  const searchTerms = [...termWords, ...tagsFilter];
  const isSearching = searchTerms.length > 0;

  const search = useFlowStateSearch({
    flowStateID: flowStateId,
    terms: searchTerms,
    // Until the scoped server search is exercised (deploy gate: re-ingest), the
    // default browse view keeps the existing feed; the scoped query runs only
    // when the user actively searches/filters (the binding SC-002 outcome).
    skip: !isSearching,
  });

  // The matched callouts, in the server's relevance order (FR-019). Rendered
  // through the default callout feed below (FR-016) — not a bespoke search card.
  const searchCalloutIds = mapFlowStateSearchCalloutIds(search.results);

  // The sidebar knowledge index reflects the browse list (unchanged); during an
  // active search the feed is replaced by the scoped results below.
  const indexEntries = mapCalloutsToListItems(callouts, sectionIndex + 1, t);

  // SPA-navigate to the callout (opens the detail dialog over this tab).
  const handleEntryClick = (id: string) => {
    const href = indexEntries.find(entry => entry.id === id)?.href;
    if (href) {
      navigate(href);
    }
  };

  const handleClearFilters = () => {
    setSubmittedTerm('');
    setTagsFilter([]);
  };

  const searchLabels = {
    emptyTitle: t('knowledge.search.emptyTitle'),
    emptyDescription: t('knowledge.search.emptyDescription'),
    errorTitle: t('knowledge.search.errorTitle'),
    errorDescription: t('knowledge.search.errorDescription'),
    retry: t('knowledge.search.retry'),
    loadingLabel: t('knowledge.search.loadingLabel'),
    appendingLabel: t('knowledge.search.appendingLabel'),
  };

  return (
    <>
      <SpaceSidebarPortal>
        <SpaceSidebar
          variant="knowledge"
          description={space.about.profile.description || ''}
          leads={sidebarLeads}
          onEditClick={permissions.canUpdate ? () => navigate(`${space.about.profile.url}/settings/about`) : undefined}
          knowledgeEntries={indexEntries}
          onKnowledgeEntryClick={handleEntryClick}
        />
      </SpaceSidebarPortal>

      <div className="space-y-6">
        <SpaceTabActionHeader
          description={tabDescription}
          action={
            canCreateCallout && (
              <Button size="sm" className="gap-2" onClick={() => setCreateOpen(true)}>
                <Plus className="w-4 h-4" aria-hidden="true" />
                {t('feed.addPost')}
              </Button>
            )
          }
        />

        {/* Scoped server search (FR-014): the term submits on Enter (FR-010) and
            tag pills ride the terms (FR-004). Replaces the old client-side,
            title-only filter so the tab no longer bulk-downloads post content to
            enable search. */}
        <div className="flex items-center gap-2">
          <FlowStateSearchField
            defaultValue={submittedTerm}
            onSubmit={setSubmittedTerm}
            placeholder={t('knowledge.searchPlaceholder')}
            ariaLabel={t('knowledge.searchLabel')}
            className="flex-1"
          />
          <TagFilterPopover tags={allTags} selectedTags={tagsFilter} onTagClick={handleToggleTag} />
        </div>

        <FilterResultsSummary searchTerm={submittedTerm} tags={tagsFilter} onClear={handleClearFilters} />

        {isSearching ? (
          <FlowStateSearchResults
            status={search.status}
            appending={search.appending}
            hasMore={search.hasMore}
            sentinelRef={search.sentinelRef}
            onRetry={search.retry}
            labels={searchLabels}
          >
            {/* Render matches through the default callout feed (FR-016): each
                LazyCalloutItem self-fetches and shows the same PostCard as browse.
                Reorder is suppressed — search results are relevance-ordered, not
                user-sortable. Descriptions start compact ("Read more") so a long
                result list stays scannable. */}
            {searchCalloutIds.map(id => (
              <LazyCalloutItem
                key={id}
                calloutId={id}
                calloutsSetId={calloutsSetId}
                canReorder={false}
                forceDescriptionCollapsed={true}
              />
            ))}
          </FlowStateSearchResults>
        ) : (
          <CalloutListConnector
            callouts={callouts}
            calloutsSetId={calloutsSetId}
            canReorder={canReorderCallouts}
            loading={loading}
          />
        )}
      </div>

      {canCreateCallout && (
        <CalloutFormConnector
          open={createOpen}
          onOpenChange={setCreateOpen}
          calloutsSetId={calloutsSetId}
          activeFlowStateName={flowStateForNewCallouts?.displayName}
          defaultTemplateId={flowStateForNewCallouts?.defaultCalloutTemplate?.id}
        />
      )}
    </>
  );
}
