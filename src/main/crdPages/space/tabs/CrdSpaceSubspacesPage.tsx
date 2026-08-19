import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSpaceDefaultTemplatesQuery, useSpaceTemplatesManagerQuery } from '@/core/apollo/generated/apollo-hooks';
import { TemplateDefaultType } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { SpaceSidebar } from '@/crd/components/space/SpaceSidebar';
import { CreateSubspaceDialog } from '@/crd/components/space/settings/CreateSubspaceDialog';
import { TemplatePicker } from '@/crd/components/templates/TemplatePicker';
import { Button } from '@/crd/primitives/button';
import { useSpace } from '@/domain/space/context/useSpace';
import { useCreateSubspace } from '@/main/crdPages/topLevelPages/spaceSettings/subspaces/useCreateSubspace';
import { buildSettingsTabUrl } from '@/main/routing/urlBuilders';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { CalloutFormConnector } from '../callout/CalloutFormConnector';
import { CalloutListConnector } from '../callout/CalloutListConnector';
import { useCrdCalloutList } from '../hooks/useCrdCalloutList';
import { useCrdSpaceLeads } from '../hooks/useCrdSpaceLeads';
import { SpaceSidebarPortal } from '../layout/SpaceSidebarPortal';
import { SpaceTabActionHeader } from '../layout/SpaceTabActionHeader';

export default function CrdSpaceSubspacesPage() {
  const { t } = useTranslation('crd-space');
  const { t: tSettings } = useTranslation('crd-spaceSettings');
  const { spaceId } = useUrlResolver();
  const { space, permissions } = useSpace();
  const navigate = useNavigate();
  const sidebarLeads = useCrdSpaceLeads(space.id);
  const {
    callouts,
    calloutsSetId,
    canCreateCallout,
    canReorderCallouts,
    tabDescription,
    flowStateForNewCallouts,
    loading: calloutsLoading,
  } = useCrdCalloutList({
    tabPosition: 2,
  });

  // US3 (feature 013): the hard-coded subspaces block was removed from this tab.
  // The subspaces are now rendered by the provisioned Subspaces (SPACES) callout
  // in the callout list below — server-provisioned on the 3rd (Subspaces) tab, on
  // top — so the tab is driven purely by its callouts. The subspace fetch/sort/map
  // machinery (`useSpaceSubspaceCardsQuery`, `useSubspacesSorted`,
  // `subspaceCardDataMapper`, `SpaceSubspacesList`) is now owned by the callout's
  // `SpaceCollectionConnector` / `useCrdSpaceSubspaces` hook.

  const [createCalloutOpen, setCreateCalloutOpen] = useState(false);
  const canCreate = permissions.canCreateSubspaces;

  // Wire the Create-Subspace template picker with the same scope as the Settings
  // flow (D21): the Space's own templates set (Space source) + account packs
  // (Account source) + the configured default subspace template (FR-031).
  // Without these the picker silently falls back to Platform templates only.
  const { data: templatesManagerData } = useSpaceTemplatesManagerQuery({
    // biome-ignore lint/style/noNonNullAssertion: ensured by skip
    variables: { spaceId: spaceId! },
    skip: !spaceId,
  });
  const templatesSetId = templatesManagerData?.lookup.space?.templatesManager?.templatesSet?.id;
  const { data: defaultTemplatesData } = useSpaceDefaultTemplatesQuery({
    // biome-ignore lint/style/noNonNullAssertion: ensured by skip
    variables: { spaceId: spaceId! },
    skip: !spaceId,
  });
  const defaultSubspaceTemplateId = defaultTemplatesData?.lookup.space?.templatesManager?.templateDefaults?.find(
    td => td.type === TemplateDefaultType.SpaceSubspace
  )?.template?.id;

  const createSubspace = useCreateSubspace(spaceId ?? '', {
    accountId: space.accountId || undefined,
    templatesSetId,
    defaultTemplateId: defaultSubspaceTemplateId,
  });
  const handleCreateClick = canCreate ? createSubspace.openDialog : undefined;

  return (
    <>
      <SpaceSidebarPortal>
        <SpaceSidebar
          variant="subspaces"
          description={space.about.profile.description || ''}
          leads={sidebarLeads}
          onEditClick={
            permissions.canUpdate ? () => navigate(buildSettingsTabUrl(space.about.profile.url, 'about')) : undefined
          }
          actionsSlot={
            (canCreateCallout || (canCreate && handleCreateClick)) && (
              <>
                {canCreateCallout && (
                  <Button className="w-full gap-2 text-body-emphasis" onClick={() => setCreateCalloutOpen(true)}>
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    {t('feed.addPost')}
                  </Button>
                )}
                {canCreate && handleCreateClick && (
                  <Button variant="outline" className="w-full gap-2 text-body-emphasis" onClick={handleCreateClick}>
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    {t('subspaces.createSubspace')}
                  </Button>
                )}
              </>
            )
          }
        />
      </SpaceSidebarPortal>

      <div className="space-y-8">
        <SpaceTabActionHeader description={tabDescription} />

        <CalloutListConnector
          callouts={callouts}
          calloutsSetId={calloutsSetId}
          canReorder={canReorderCallouts}
          loading={calloutsLoading}
        />
      </div>

      {canCreateCallout && (
        <CalloutFormConnector
          open={createCalloutOpen}
          onOpenChange={setCreateCalloutOpen}
          calloutsSetId={calloutsSetId}
          activeFlowStateName={flowStateForNewCallouts?.displayName}
          defaultTemplateId={flowStateForNewCallouts?.defaultCalloutTemplate?.id}
        />
      )}

      {canCreate && (
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
