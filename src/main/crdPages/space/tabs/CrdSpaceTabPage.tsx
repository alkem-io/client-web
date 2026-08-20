import { Plus, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useCalloutsSetTagsQuery,
  useSpaceDefaultTemplatesQuery,
  useSpaceTemplatesManagerQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { TemplateDefaultType } from '@/core/apollo/generated/graphql-schema';
import { TagFilterPopover } from '@/crd/components/common/TagFilterPopover';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { FlowStateSearchResults } from '@/crd/components/search/FlowStateSearchResults';
import { CreateSubspaceDialog } from '@/crd/components/space/settings/CreateSubspaceDialog';
import { TemplatePicker } from '@/crd/components/templates/TemplatePicker';
import { FlowStateSearchField } from '@/crd/forms/FlowStateSearchField';
import { Button } from '@/crd/primitives/button';
import { classificationTagsetModelToTagsetArgs } from '@/domain/collaboration/calloutsSet/Classification/ClassificationTagset.utils';
import { useSpace } from '@/domain/space/context/useSpace';
import { useCreateSubspace } from '@/main/crdPages/topLevelPages/spaceSettings/subspaces/useCreateSubspace';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { CalloutFormConnector } from '../callout/CalloutFormConnector';
import { CalloutListConnector } from '../callout/CalloutListConnector';
import { LazyCalloutItem } from '../callout/LazyCalloutItem';
import { mapFlowStateSearchCalloutIds } from '../dataMappers/flowStateSearchDataMapper';
import { InviteMembersDialogConnector } from '../dialogs/InviteMembersDialogConnector';
import { useCrdCalloutList } from '../hooks/useCrdCalloutList';
import { useFlowStateSearch } from '../hooks/useFlowStateSearch';
import { SpaceTabActionHeader } from '../layout/SpaceTabActionHeader';
import { SpaceTabSidebarConnector } from '../layout/SpaceTabSidebarConnector';

// Fixed L0 tab positions carrying a non-sidebar main-content affordance that
// stays position-keyed rather than becoming a configurable widget (A-03/D-08):
// header Invite on Community (1), header Create-Subspace on Subspaces (2),
// the search block on every custom/added tab (3+).
const COMMUNITY_TAB_POSITION = 1;
const SUBSPACES_TAB_POSITION = 2;
const FIRST_CUSTOM_TAB_POSITION = 3;

type CrdSpaceTabPageProps = {
  tabPosition: number;
};

export default function CrdSpaceTabPage({ tabPosition }: CrdSpaceTabPageProps) {
  const { t } = useTranslation(['crd-common', 'crd-space']);
  const { t: tSettings } = useTranslation('crd-spaceSettings');
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

  // Header Invite (Community tab only) — a main-content affordance, independent
  // of whether the `addUser` widget is configured on this (or any) tab's sidebar.
  const isCommunityTab = tabPosition === COMMUNITY_TAB_POSITION;
  const canInvite = isCommunityTab && permissions.canUpdate;
  const [inviteOpen, setInviteOpen] = useState(false);

  // Header Create Subspace (Subspaces tab only).
  const isSubspacesTab = tabPosition === SUBSPACES_TAB_POSITION;
  const canCreateSubspace = isSubspacesTab && permissions.canCreateSubspaces;
  const { data: templatesManagerData } = useSpaceTemplatesManagerQuery({
    // biome-ignore lint/style/noNonNullAssertion: ensured by skip
    variables: { spaceId: spaceId! },
    skip: !spaceId || !isSubspacesTab,
  });
  const templatesSetId = templatesManagerData?.lookup.space?.templatesManager?.templatesSet?.id;
  const { data: defaultTemplatesData } = useSpaceDefaultTemplatesQuery({
    // biome-ignore lint/style/noNonNullAssertion: ensured by skip
    variables: { spaceId: spaceId! },
    skip: !spaceId || !isSubspacesTab,
  });
  const defaultSubspaceTemplateId = defaultTemplatesData?.lookup.space?.templatesManager?.templateDefaults?.find(
    td => td.type === TemplateDefaultType.SpaceSubspace
  )?.template?.id;
  const createSubspace = useCreateSubspace(spaceId ?? '', {
    accountId: space.accountId || undefined,
    templatesSetId,
    defaultTemplateId: defaultSubspaceTemplateId,
  });
  const handleCreateSubspaceClick = canCreateSubspace ? createSubspace.openDialog : undefined;

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

  const hasHeaderAction = canInvite || (canCreateSubspace && handleCreateSubspaceClick) || canCreateCallout;
  const headerAction = hasHeaderAction && (
    <div className="flex items-center gap-2">
      {canInvite && (
        <Button size="sm" className="gap-2" onClick={() => setInviteOpen(true)}>
          <UserPlus className="w-4 h-4" aria-hidden="true" />
          {t('crd-space:members.inviteMember')}
        </Button>
      )}
      {canCreateSubspace && handleCreateSubspaceClick && (
        <Button size="sm" className="gap-2" onClick={handleCreateSubspaceClick}>
          <Plus className="w-4 h-4" aria-hidden="true" />
          {t('crd-space:subspaces.createSubspace')}
        </Button>
      )}
      {canCreateCallout && (
        <Button size="sm" className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4" aria-hidden="true" />
          {t('crd-space:feed.addPost')}
        </Button>
      )}
    </div>
  );

  return (
    <>
      <SpaceTabSidebarConnector
        sidebar={flowStateForNewCallouts?.settings.sidebar ?? []}
        calloutsSetId={calloutsSetId}
        classificationTagsets={classificationTagsets}
        tabPosition={tabPosition}
      />

      <div className="space-y-6">
        <SpaceTabActionHeader description={tabDescription} action={headerAction} />

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

      {canInvite && <InviteMembersDialogConnector open={inviteOpen} onClose={() => setInviteOpen(false)} />}

      {canCreateSubspace && (
        <>
          <CreateSubspaceDialog
            open={createSubspace.open}
            onOpenChange={open => {
              if (!open) createSubspace.closeDialog();
            }}
            values={createSubspace.values}
            errors={createSubspace.errors}
            selectedTemplateName={createSubspace.selectedTemplateName}
            selectedTemplateContent={createSubspace.selectedTemplateContent}
            selectedTemplateLoading={createSubspace.selectedTemplateLoading}
            onOpenTemplatePicker={createSubspace.onOpenTemplatePicker}
            onClearTemplate={createSubspace.onClearTemplate}
            submitting={createSubspace.submitting}
            canSubmit={createSubspace.canSubmit}
            avatarConstraints={createSubspace.avatarConstraints}
            cardBannerConstraints={createSubspace.cardBannerConstraints}
            onChange={createSubspace.onChange}
            onSubmit={() => void createSubspace.onSubmit()}
          />
          <TemplatePicker {...createSubspace.picker} />
          <ConfirmationDialog
            open={createSubspace.overwriteConfirmOpen}
            onOpenChange={open => {
              if (!open) createSubspace.onCancelOverwriteTemplate();
            }}
            title={tSettings('subspaces.createDialog.template.overwriteConfirm.title')}
            description={tSettings('subspaces.createDialog.template.overwriteConfirm.description')}
            confirmLabel={tSettings('subspaces.createDialog.template.overwriteConfirm.confirm')}
            cancelLabel={tSettings('subspaces.createDialog.template.overwriteConfirm.cancel')}
            onConfirm={createSubspace.onConfirmOverwriteTemplate}
            onCancel={createSubspace.onCancelOverwriteTemplate}
          />
        </>
      )}
    </>
  );
}
