import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useCalloutsSetTagsQuery,
  useSpaceDefaultTemplatesQuery,
  useSpaceTemplatesManagerQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { TemplateDefaultType } from '@/core/apollo/generated/graphql-schema';
import { FlowStateSearchResults } from '@/crd/components/search/FlowStateSearchResults';
import { TabStateHeader } from '@/crd/components/space/TabStateHeader';
import { classificationTagsetModelToTagsetArgs } from '@/domain/collaboration/calloutsSet/Classification/ClassificationTagset.utils';
import { useSpace } from '@/domain/space/context/useSpace';
import { CreateSubspaceDialogs } from '@/main/crdPages/topLevelPages/spaceSettings/subspaces/CreateSubspaceDialogs';
import { useCreateSubspace } from '@/main/crdPages/topLevelPages/spaceSettings/subspaces/useCreateSubspace';
import { useDebouncedValue } from '@/main/crdPages/utils/useDebouncedValue';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { CalloutFormConnector } from '../callout/CalloutFormConnector';
import { CalloutListConnector } from '../callout/CalloutListConnector';
import { LazyCalloutItem } from '../callout/LazyCalloutItem';
import { buildFlowStateSearchTerms, mapFlowStateSearchCalloutIds } from '../dataMappers/flowStateSearchDataMapper';
import { useCrdCalloutList } from '../hooks/useCrdCalloutList';
import { useFlowStateSearch } from '../hooks/useFlowStateSearch';
import { SpaceTabSidebarConnector } from '../layout/SpaceTabSidebarConnector';
import { resolveSidebarPlan } from '../layout/sidebarWidgetPlan';

/** Debounce window between a keystroke and the search it drives (SC-003). */
const SEARCH_DEBOUNCE_MS = 300;
const isEmptySearchText = (text: string) => text === '';

type CrdSpaceTabPageProps = {
  tabPosition: number;
  /** Opens the layout-owned shared About dialog (single mount, see CrdSpacePageLayout). */
  onOpenAbout: () => void;
};

export default function CrdSpaceTabPage({ tabPosition, onOpenAbout }: CrdSpaceTabPageProps) {
  const { t } = useTranslation(['crd-common', 'crd-space']);
  const { spaceId } = useUrlResolver();
  const { space, permissions } = useSpace();

  const {
    callouts,
    calloutsSetId,
    classificationTagsets,
    canCreateCallout,
    canReorderCallouts,
    tabDescription,
    flowStateForNewCallouts,
    loading,
  } = useCrdCalloutList({ tabPosition });

  const [createOpen, setCreateOpen] = useState(false);

  // Create Subspace — the `createSubspace` sidebar widget (A-03: the former
  // Subspaces-tab action slot is retired, so the button follows the tab
  // configuration). The page keeps the dialog + flow; the connector renders
  // the button. Template queries fire only when the widget is configured on
  // this tab AND the viewer can create subspaces (FR-012/FR-019).
  const sidebarWire = flowStateForNewCallouts?.settings.sidebar ?? [];
  const sidebarPlan = resolveSidebarPlan(sidebarWire);
  // The Subspaces dialog (opened from the `subspaceLinks` widget's "Show all")
  // also offers Create Subspace, so the dialog + template queries must be live
  // for either entry point — not only the dedicated `createSubspace` widget.
  const hasCreateSubspaceEntry = sidebarPlan.includes('createSubspace') || sidebarPlan.includes('subspaceLinks');
  const canCreateSubspace = hasCreateSubspaceEntry && permissions.canCreateSubspaces;
  const { data: templatesManagerData } = useSpaceTemplatesManagerQuery({
    // biome-ignore lint/style/noNonNullAssertion: ensured by skip
    variables: { spaceId: spaceId! },
    skip: !spaceId || !canCreateSubspace,
  });
  const templatesSetId = templatesManagerData?.lookup.space?.templatesManager?.templatesSet?.id;
  const { data: defaultTemplatesData } = useSpaceDefaultTemplatesQuery({
    // biome-ignore lint/style/noNonNullAssertion: ensured by skip
    variables: { spaceId: spaceId! },
    skip: !spaceId || !canCreateSubspace,
  });
  const defaultSubspaceTemplateId = defaultTemplatesData?.lookup.space?.templatesManager?.templateDefaults?.find(
    td => td.type === TemplateDefaultType.SpaceSubspace
  )?.template?.id;
  const createSubspace = useCreateSubspace(spaceId ?? '', {
    accountId: space.accountId || undefined,
    templatesSetId,
    defaultTemplateId: defaultSubspaceTemplateId,
  });

  // Search widget (the sidebar `search` widget — every tab it's configured
  // on, not position-keyed). The page owns all of the search state and data
  // fetching because the sidebar subtree is portalled into two hosts
  // (desktop column, mobile drawer); the widget itself is a pure controlled
  // component.
  const hasSearchWidget = sidebarPlan.includes('search');
  const [tagsFilter, setTagsFilter] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  // Clearing the field applies immediately — only a non-empty value waits out
  // the debounce, so the X button (and deleting down to empty) never lags, and
  // a term typed right after a clear can never re-apply the cleared one.
  const appliedText = useDebouncedValue(searchText, SEARCH_DEBOUNCE_MS, { immediate: isEmptySearchText }).trim();
  const flowStateId = flowStateForNewCallouts?.id;
  const { data: tagsData } = useCalloutsSetTagsQuery({
    variables: {
      // biome-ignore lint/style/noNonNullAssertion: ensured by skip
      calloutsSetId: calloutsSetId!,
      classificationTagsets: classificationTagsetModelToTagsetArgs(classificationTagsets),
    },
    skip: !calloutsSetId || !hasSearchWidget,
  });
  const allTags = tagsData?.lookup.calloutsSet?.tags ?? [];
  const handleToggleTag = (tag: string) => {
    setTagsFilter(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
  };
  // The applied text and every selected tag are joined into exactly one term —
  // identical to what the search service does internally, and it keeps the
  // request's term count structurally under the service's limit regardless of
  // how many tags are selected.
  const searchTerms = buildFlowStateSearchTerms(appliedText, tagsFilter);
  const isSearching = hasSearchWidget && searchTerms.length > 0;
  const search = useFlowStateSearch({
    flowStateID: flowStateId,
    spaceID: space.id,
    terms: searchTerms,
    skip: !isSearching,
  });
  const searchCalloutIds = mapFlowStateSearchCalloutIds(search.results);
  const matchCount = search.status === 'results' || search.status === 'empty' ? searchCalloutIds.length : undefined;
  const clearSearch = () => {
    setSearchText('');
    setTagsFilter([]);
  };
  const searchLabels = {
    emptyTitle: t('crd-space:knowledge.search.emptyTitle'),
    emptyDescription: t('crd-space:knowledge.search.emptyDescription'),
    errorTitle: t('crd-space:knowledge.search.errorTitle'),
    errorDescription: t('crd-space:knowledge.search.errorDescription'),
    retry: t('crd-space:knowledge.search.retry'),
    loadingLabel: t('crd-space:knowledge.search.loadingLabel'),
    appendingLabel: t('crd-space:knowledge.search.appendingLabel'),
  };

  return (
    <>
      <SpaceTabSidebarConnector
        sidebar={sidebarWire}
        calloutsSetId={calloutsSetId}
        classificationTagsets={classificationTagsets}
        tabPosition={tabPosition}
        canCreatePost={canCreateCallout}
        onCreatePost={() => setCreateOpen(true)}
        onAboutClick={onOpenAbout}
        onCreateSubspace={createSubspace.openDialog}
        search={{
          text: searchText,
          onTextChange: setSearchText,
          appliedText,
          allTags,
          selectedTags: tagsFilter,
          onToggleTag: handleToggleTag,
          matchCount,
          hasMore: search.hasMore,
          onClear: clearSearch,
        }}
      />

      <div className="space-y-6">
        <TabStateHeader description={tabDescription} />

        {isSearching ? (
          <FlowStateSearchResults
            status={search.status}
            appending={search.appending}
            hasMore={search.hasMore}
            sentinelRef={search.sentinelRef}
            onRetry={search.retry}
            labels={searchLabels}
          >
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

      {canCreateSubspace && <CreateSubspaceDialogs createSubspace={createSubspace} />}
    </>
  );
}
