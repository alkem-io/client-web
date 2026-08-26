import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useCalloutsSetTagsQuery,
  useSpaceDefaultTemplatesQuery,
  useSpaceTemplatesManagerQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { TemplateDefaultType } from '@/core/apollo/generated/graphql-schema';
import { TagFilterPopover } from '@/crd/components/common/TagFilterPopover';
import { FlowStateSearchResults } from '@/crd/components/search/FlowStateSearchResults';
import { TabStateHeader } from '@/crd/components/space/TabStateHeader';
import { FlowStateSearchField } from '@/crd/forms/FlowStateSearchField';
import { classificationTagsetModelToTagsetArgs } from '@/domain/collaboration/calloutsSet/Classification/ClassificationTagset.utils';
import { useSpace } from '@/domain/space/context/useSpace';
import { CreateSubspaceDialogs } from '@/main/crdPages/topLevelPages/spaceSettings/subspaces/CreateSubspaceDialogs';
import { useCreateSubspace } from '@/main/crdPages/topLevelPages/spaceSettings/subspaces/useCreateSubspace';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { CalloutFormConnector } from '../callout/CalloutFormConnector';
import { CalloutListConnector } from '../callout/CalloutListConnector';
import { LazyCalloutItem } from '../callout/LazyCalloutItem';
import { mapFlowStateSearchCalloutIds } from '../dataMappers/flowStateSearchDataMapper';
import { useCrdCalloutList } from '../hooks/useCrdCalloutList';
import { useFlowStateSearch } from '../hooks/useFlowStateSearch';
import { SpaceTabSidebarConnector } from '../layout/SpaceTabSidebarConnector';
import { resolveSidebarPlan } from '../layout/sidebarWidgetPlan';

// Fixed L0 tab position carrying the one remaining position-keyed affordance:
// the search block on every custom/added tab (3+). Create Subspace is now the
// `createSubspace` widget (its position-driven action slot is retired, A-03),
// Add Post the `createPost` widget, and Invite the `addUser` widget — all
// owned by the sidebar connector.
const FIRST_CUSTOM_TAB_POSITION = 3;

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

  // Search block (custom/added tabs only, position 3+).
  const isCustomTab = tabPosition >= FIRST_CUSTOM_TAB_POSITION;
  const [tagsFilter, setTagsFilter] = useState<string[]>([]);
  // Free-text terms, each formed into a pill on Enter (FR-010) — not live keystrokes.
  const [termPills, setTermPills] = useState<string[]>([]);
  const flowStateId = flowStateForNewCallouts?.id;
  const { data: tagsData } = useCalloutsSetTagsQuery({
    variables: {
      // biome-ignore lint/style/noNonNullAssertion: ensured by skip
      calloutsSetId: calloutsSetId!,
      classificationTagsets: classificationTagsetModelToTagsetArgs(classificationTagsets),
    },
    skip: !calloutsSetId || !isCustomTab,
  });
  const allTags = tagsData?.lookup.calloutsSet?.tags ?? [];
  const handleToggleTag = (tag: string) => {
    setTagsFilter(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
  };
  const termWords = termPills.flatMap(pill => pill.trim().split(/\s+/)).filter(Boolean);
  const searchTerms = [...termWords, ...tagsFilter];
  const isSearching = isCustomTab && searchTerms.length > 0;
  const search = useFlowStateSearch({
    flowStateID: flowStateId,
    terms: searchTerms,
    skip: !isSearching,
  });
  const searchCalloutIds = mapFlowStateSearchCalloutIds(search.results);
  const handleTermAdd = (term: string) => setTermPills(prev => [...prev, term]);
  const handleTermRemove = (index: number) => setTermPills(prev => prev.filter((_, i) => i !== index));
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
      />

      <div className="space-y-6">
        <TabStateHeader description={tabDescription} />

        {isCustomTab && (
          <div className="flex items-start gap-2">
            <FlowStateSearchField
              terms={termPills}
              onTermAdd={handleTermAdd}
              onTermRemove={handleTermRemove}
              tags={tagsFilter}
              onTagRemove={handleToggleTag}
              removeTagAriaLabel={tag => t('crd-space:knowledge.search.removeTag', { tag })}
              placeholder={t('crd-space:knowledge.searchPlaceholder')}
              ariaLabel={t('crd-space:knowledge.searchLabel')}
              removeTermAriaLabel={term => t('crd-space:knowledge.search.removeTerm', { term })}
              className="flex-1"
            />
            <TagFilterPopover tags={allTags} selectedTags={tagsFilter} onTagClick={handleToggleTag} />
          </div>
        )}

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
