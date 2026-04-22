import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImageCropDialog } from '@/crd/components/common/ImageCropDialog';
import { LoadingSpinner } from '@/crd/components/common/LoadingSpinner';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { AddCommunityMemberDialog } from '@/crd/components/space/settings/AddCommunityMemberDialog';
import { ApplicationFormEditor } from '@/crd/components/space/settings/ApplicationFormEditor';
import { ChangeDefaultSubspaceTemplateDialog } from '@/crd/components/space/settings/ChangeDefaultSubspaceTemplateDialog';
import { CommunityGuidelinesEditor } from '@/crd/components/space/settings/CommunityGuidelinesEditor';
import { CreateSubspaceDialog } from '@/crd/components/space/settings/CreateSubspaceDialog';
import { InviteMembersDialog } from '@/crd/components/space/settings/InviteMembersDialog';
import { SaveSubspaceAsTemplateDialog } from '@/crd/components/space/settings/SaveSubspaceAsTemplateDialog';
import { SpaceSettingsAboutView } from '@/crd/components/space/settings/SpaceSettingsAboutView';
import { SpaceSettingsAccountView } from '@/crd/components/space/settings/SpaceSettingsAccountView';
import { SpaceSettingsCommunityView } from '@/crd/components/space/settings/SpaceSettingsCommunityView';
import { SpaceSettingsLayoutView } from '@/crd/components/space/settings/SpaceSettingsLayoutView';
import { SpaceSettingsSettingsView } from '@/crd/components/space/settings/SpaceSettingsSettingsView';
import { SpaceSettingsStorageView } from '@/crd/components/space/settings/SpaceSettingsStorageView';
import { SpaceSettingsSubspacesView } from '@/crd/components/space/settings/SpaceSettingsSubspacesView';
import { SpaceSettingsTemplatesView } from '@/crd/components/space/settings/SpaceSettingsTemplatesView';
import { SpaceSettingsUpdatesView } from '@/crd/components/space/settings/SpaceSettingsUpdatesView';
import { TemplateEditDialog } from '@/crd/components/space/settings/TemplateEditDialog';
import { TemplateLibraryDialog } from '@/crd/components/space/settings/TemplateLibraryDialog';
import { TemplatePreviewDialog } from '@/crd/components/space/settings/TemplatePreviewDialog';
import { COUNTRIES } from '@/domain/common/location/countries.constants';
import { useSpace } from '@/domain/space/context/useSpace';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { useAboutTabData } from './about/useAboutTabData';
import { useAccountTabData } from './account/useAccountTabData';
import {
  useAddOrganizationDialog,
  useAddVirtualContributorDialog,
  useAddVirtualContributorExternalDialog,
  useInviteUsersDialog,
} from './community/useAddCommunityMemberDialog';
import { useCommunityGuidelinesData } from './community/useCommunityGuidelinesData';
import { useCommunityTabData } from './community/useCommunityTabData';
import { useColumnMenu } from './layout/useColumnMenu';
import { useLayoutTabData } from './layout/useLayoutTabData';
import { useApplicationFormData } from './settings/useApplicationFormData';
import { useSettingsTabData } from './settings/useSettingsTabData';
import { useStorageTabData } from './storage/useStorageTabData';
import { useCreateSubspace } from './subspaces/useCreateSubspace';
import { useSaveSubspaceAsTemplate } from './subspaces/useSaveSubspaceAsTemplate';
import { useSubspacesTabData } from './subspaces/useSubspacesTabData';
import { useTemplatesTabData } from './templates/useTemplatesTabData';
import { useUpdatesTabData } from './updates/useUpdatesTabData';
import { useDirtyTabGuard } from './useDirtyTabGuard';
import { useSpaceSettingsTab } from './useSpaceSettingsTab';

/**
 * CrdSpaceSettingsPage — route entry for the CRD Space Settings area.
 *
 * Renders the horizontal tab strip + the active tab's panel. The CRD space
 * hero is provided by the enclosing `CrdSpacePageLayout` — we intentionally do
 * NOT render a second hero here.
 */
export default function CrdSpaceSettingsPage() {
  const { t } = useTranslation('crd-spaceSettings');
  const { spaceId, spaceLevel, loading: resolvingUrl } = useUrlResolver();
  const { space, loading: loadingSpace } = useSpace();
  const accountId = space?.accountId;
  const { activeTab, setActiveTab } = useSpaceSettingsTab();
  const guard = useDirtyTabGuard();

  const spaceUrl = space?.about.profile.url ?? '';
  const roleSetId = space?.about.membership?.roleSetID ?? '';
  const communityId = space?.about.membership?.communityID ?? '';
  const about = useAboutTabData(spaceId ?? '', spaceUrl);
  const layout = useLayoutTabData(spaceId ?? '');
  const community = useCommunityTabData(roleSetId);
  const subspacesTab = useSubspacesTabData(spaceId ?? '');
  const createSubspace = useCreateSubspace(spaceId ?? '');
  const saveAsTemplate = useSaveSubspaceAsTemplate({
    templatesSetId: subspacesTab.templatesSetId,
    onSaved: () => subspacesTab.closeSaveAsTemplate(),
  });
  const templatesTab = useTemplatesTabData(spaceId ?? '', accountId || undefined);
  const storageTab = useStorageTabData(spaceId ?? '');
  const settingsTab = useSettingsTabData(spaceId ?? '');
  const applicationForm = useApplicationFormData(settingsTab.roleSetId);
  const accountTab = useAccountTabData(spaceId ?? '');
  const updatesTab = useUpdatesTabData(communityId || undefined);
  const communityGuidelinesId = space?.about?.guidelines?.id;
  const communityGuidelines = useCommunityGuidelinesData(communityGuidelinesId);
  const addOrgDialog = useAddOrganizationDialog({ community: community._adminRef });
  const addVCDialog = useAddVirtualContributorDialog({
    community: community._adminRef,
    spaceId: spaceId ?? '',
    spaceLevel,
  });
  const addVCExternalDialog = useAddVirtualContributorExternalDialog({
    community: community._adminRef,
    spaceId: spaceId ?? '',
    spaceLevel,
  });
  const inviteDialog = useInviteUsersDialog({ community: community._adminRef });
  const columnMenu = useColumnMenu({
    innovationFlowId: layout.innovationFlowId,
    availablePostTemplates: [],
    callouts: layout.columns.flatMap(col =>
      col.callouts.map(c => ({ id: c.id, flowStateTagsetId: c.flowStateTagsetId, currentStateName: col.title }))
    ),
    columnNames: layout.columns.map(c => ({ id: c.id, title: c.title })),
    onColumnSaved: (columnId, title, description) => {
      layout.markColumnSaved(columnId, title, description);
    },
  });

  // About uses per-section inline Save, so it does NOT participate in the
  // tab-switch guard. Only Layout and the Application Form can enter a
  // buffered-dirty state that needs protection.
  useEffect(() => {
    if (layout.isDirty || applicationForm.isDirty) {
      guard.markDirty();
    } else {
      guard.clearDirty();
    }
  }, [guard, layout.isDirty, applicationForm.isDirty]);

  const [layoutDiscardOpen, setLayoutDiscardOpen] = useState(false);

  // Bridge: when Subspaces tab signals "save as template" for a subspace,
  // hand it off to the dedicated dialog hook with the subspace's current name.
  useEffect(() => {
    if (!subspacesTab.saveAsTemplateSubspaceId) return;
    const target = subspacesTab.subspaces.find(s => s.id === subspacesTab.saveAsTemplateSubspaceId);
    if (!target) return;
    saveAsTemplate.onOpen({ subspaceId: target.id, subspaceName: target.name });
    subspacesTab.closeSaveAsTemplate();
  }, [subspacesTab, saveAsTemplate]);

  const handleConfirmSwitchSave = async () => {
    if (layout.isDirty) await layout.onSave();
    if (applicationForm.isDirty) applicationForm.onSave();
    guard.clearDirty();
    const target = guard.pendingSwitch;
    guard.resolvePendingSwitch(true);
    if (target) {
      setActiveTab(target);
    }
  };
  const handleConfirmSwitchDiscard = () => {
    layout.onReset();
    guard.clearDirty();
    const target = guard.pendingSwitch;
    guard.resolvePendingSwitch(true);
    if (target) {
      setActiveTab(target);
    }
  };
  const handleConfirmSwitchCancel = () => {
    guard.resolvePendingSwitch(false);
  };

  const handleLayoutDiscardConfirm = () => {
    layout.onReset();
    setLayoutDiscardOpen(false);
  };

  const bootstrapping = resolvingUrl || loadingSpace || !spaceId;

  return (
    <div className="flex flex-col gap-4 pt-6">
      <div className="rounded-xl border bg-card p-6 pb-24">
        {bootstrapping ? (
          <LoadingSpinner />
        ) : (
          <>
            {activeTab === 'about' &&
              (about.values && about.previewCard ? (
                <SpaceSettingsAboutView
                  {...about.values}
                  previewCard={about.previewCard}
                  countries={COUNTRIES}
                  dirtyByField={about.dirtyByField}
                  saveStatusByField={about.saveStatusByField}
                  onChange={about.onChange}
                  onUploadAvatar={about.onUploadAvatar}
                  onUploadPageBanner={about.onUploadPageBanner}
                  onUploadCardBanner={about.onUploadCardBanner}
                  onAddReference={about.onAddReference}
                  onUpdateReference={about.onUpdateReference}
                  onRemoveReference={about.onRequestRemoveReference}
                  onSaveSection={section => void about.onSaveSection(section)}
                />
              ) : (
                <LoadingSpinner />
              ))}
            {activeTab === 'layout' && (
              <SpaceSettingsLayoutView
                columns={layout.columns}
                postDescriptionDisplay={layout.postDescriptionDisplay}
                saveBar={layout.saveBar}
                onReorder={layout.onReorder}
                onRenameColumn={layout.onRenameColumn}
                onMoveToColumn={layout.onMoveToColumn}
                onViewPost={calloutId => {
                  void calloutId;
                  // TODO(US2): wire to the post's URL once SpaceCalloutPage route is finalized.
                  // Leaving as a no-op for now keeps the contract shape without breaking navigation.
                }}
                onPostDescriptionDisplayChange={layout.onPostDescriptionDisplayChange}
                onSave={layout.onSave}
                onDiscardChanges={() => setLayoutDiscardOpen(true)}
                columnMenuActions={columnMenu}
              />
            )}
            {activeTab === 'community' && (
              <SpaceSettingsCommunityView
                members={community.members}
                organizations={community.organizations}
                virtualContributors={community.virtualContributors}
                applicationFormSlot={
                  settingsTab.roleSetId ? (
                    <ApplicationFormEditor
                      description={applicationForm.description}
                      questions={applicationForm.questions}
                      loading={applicationForm.loading}
                      canSave={applicationForm.canSave}
                      onDescriptionChange={applicationForm.onDescriptionChange}
                      onQuestionChange={applicationForm.onQuestionChange}
                      onQuestionRequiredChange={applicationForm.onQuestionRequiredChange}
                      onQuestionAdd={applicationForm.onQuestionAdd}
                      onQuestionDelete={applicationForm.onQuestionDelete}
                      onQuestionMoveUp={applicationForm.onQuestionMoveUp}
                      onQuestionMoveDown={applicationForm.onQuestionMoveDown}
                      onSave={applicationForm.onSave}
                    />
                  ) : undefined
                }
                communityGuidelinesSlot={
                  communityGuidelinesId ? (
                    <CommunityGuidelinesEditor
                      value={communityGuidelines.description}
                      loading={communityGuidelines.loading}
                      submitting={communityGuidelines.submitting}
                      canSave={communityGuidelines.canSave}
                      onChange={communityGuidelines.onDescriptionChange}
                      onSave={() => void communityGuidelines.onSave()}
                    />
                  ) : undefined
                }
                permissions={community.permissions}
                onUserRemove={community.onUserRemove}
                onOrgAdd={addOrgDialog.openDialog}
                onOrgRemove={community.onOrgRemove}
                onVCAdd={addVCDialog.openDialog}
                onVCAddExternal={addVCExternalDialog.openDialog}
                onVCRemove={community.onVCRemove}
                onApplicationApprove={community.onApplicationApprove}
                onApplicationReject={community.onApplicationReject}
                onInvitationDelete={community.onInvitationDelete}
                onPlatformInvitationDelete={community.onPlatformInvitationDelete}
                onInviteUsers={inviteDialog.openDialog}
              />
            )}
            {activeTab === 'subspaces' && (
              <SpaceSettingsSubspacesView
                subspaces={subspacesTab.subspaces}
                canCreate={subspacesTab.canCreate}
                canSaveAsTemplate={subspacesTab.canSaveAsTemplate}
                loading={subspacesTab.loading}
                onCreate={() => createSubspace.openDialog()}
                onChangeDefaultTemplate={subspacesTab.onChangeDefaultTemplate}
                onKebabAction={subspacesTab.onKebabAction}
              />
            )}
            {activeTab === 'templates' && (
              <SpaceSettingsTemplatesView
                categories={templatesTab.categories}
                loading={templatesTab.loading}
                duplicatingCategory={templatesTab.actions.duplicatingCategory}
                onCreateTemplate={templatesTab.onCreateTemplate}
                onImportTemplate={templatesTab.onImportTemplate}
                onTemplateAction={templatesTab.onTemplateAction}
              />
            )}
            {activeTab === 'updates' && (
              <SpaceSettingsUpdatesView
                messages={updatesTab.messages}
                draft={updatesTab.draft}
                loading={updatesTab.loading}
                submitting={updatesTab.submitting}
                removing={updatesTab.removing}
                canEdit={!!communityId}
                canRemove={!!communityId}
                onDraftChange={updatesTab.onDraftChange}
                onSubmit={() => void updatesTab.onSubmit()}
                onRequestRemove={updatesTab.onRequestRemove}
              />
            )}
            {activeTab === 'storage' && (
              <SpaceSettingsStorageView
                tree={storageTab.tree}
                expandedFolderIds={storageTab.expandedFolderIds}
                loading={storageTab.loading}
                onToggleFolder={storageTab.onToggleFolder}
                onDelete={storageTab.onDelete}
              />
            )}
            {activeTab === 'settings' && (
              <SpaceSettingsSettingsView
                privacy={settingsTab.privacy}
                membershipPolicy={settingsTab.membershipPolicy}
                allowedActions={settingsTab.allowedActions}
                hostOrganizationTrusted={settingsTab.hostOrganizationTrusted}
                providerDisplayName={settingsTab.providerDisplayName}
                loading={settingsTab.loading}
                updatingKeys={settingsTab.updatingKeys}
                onPrivacyChange={settingsTab.onPrivacyChange}
                onMembershipPolicyChange={settingsTab.onMembershipPolicyChange}
                onToggleAllowedAction={settingsTab.onToggleAllowedAction}
                onHostOrgTrustChange={settingsTab.onHostOrgTrustChange}
              />
            )}
            {activeTab === 'account' && (
              <SpaceSettingsAccountView
                url={accountTab.url}
                plan={accountTab.plan}
                visibility={accountTab.visibility}
                host={accountTab.host}
                contactSupportHref={accountTab.contactSupportHref}
                changeLicenseHref={accountTab.changeLicenseHref}
                canDeleteSpace={accountTab.canDeleteSpace}
                loading={accountTab.loading}
                onDeleteSpace={accountTab.onDeleteSpace}
              />
            )}
          </>
        )}
      </div>

      <ConfirmationDialog
        open={updatesTab.pendingRemoveMessage !== null}
        onOpenChange={open => {
          if (!open) updatesTab.onCancelRemove();
        }}
        variant="destructive"
        title={t('updates.deleteDialog.title', { defaultValue: 'Delete update' })}
        description={t('updates.deleteDialog.description', {
          defaultValue: 'Are you sure you want to delete this update? This cannot be undone.',
        })}
        confirmLabel={t('updates.deleteDialog.confirm', { defaultValue: 'Delete' })}
        cancelLabel={t('dirtyGuard.cancel', { defaultValue: 'Cancel' })}
        onConfirm={() => void updatesTab.onConfirmRemove()}
        onCancel={updatesTab.onCancelRemove}
      />

      <SaveSubspaceAsTemplateDialog
        open={saveAsTemplate.open}
        onOpenChange={open => {
          if (!open) saveAsTemplate.onClose();
        }}
        subspaceName={saveAsTemplate.subspaceName}
        activeSpaceName={saveAsTemplate.activeSpaceName}
        values={saveAsTemplate.values}
        errors={saveAsTemplate.errors}
        submitting={saveAsTemplate.submitting}
        canSubmit={saveAsTemplate.canSubmit}
        preview={saveAsTemplate.preview}
        previewLoading={saveAsTemplate.previewLoading}
        urlLoader={saveAsTemplate.urlLoader}
        onChange={saveAsTemplate.onChange}
        onSubmit={() => void saveAsTemplate.onSubmit()}
        onOpenUrlLoader={saveAsTemplate.onOpenUrlLoader}
        onCloseUrlLoader={saveAsTemplate.onCloseUrlLoader}
        onUrlChange={saveAsTemplate.onUrlChange}
        onUseUrl={() => void saveAsTemplate.onUseUrl()}
      />

      <CreateSubspaceDialog
        open={createSubspace.open}
        onOpenChange={open => {
          if (!open) createSubspace.closeDialog();
        }}
        values={createSubspace.values}
        errors={createSubspace.errors}
        templates={createSubspace.templates}
        templatesLoading={createSubspace.templatesLoading}
        submitting={createSubspace.submitting}
        canSubmit={createSubspace.canSubmit}
        avatarConstraints={createSubspace.avatarConstraints}
        cardBannerConstraints={createSubspace.cardBannerConstraints}
        onChange={createSubspace.onChange}
        onSubmit={() => void createSubspace.onSubmit()}
      />

      <ChangeDefaultSubspaceTemplateDialog
        open={subspacesTab.selectDefaultTemplateOpen}
        onOpenChange={open => {
          if (!open) subspacesTab.closeSelectDefaultTemplate();
        }}
        templates={subspacesTab.subspaceTemplateChoices}
        currentTemplateId={subspacesTab.defaultTemplateId}
        libraryHref={`${spaceUrl}/settings/templates`}
        loading={subspacesTab.subspaceTemplatesLoading}
        onSave={subspacesTab.onSelectDefaultTemplate}
        saving={subspacesTab.subspaceTemplatesSaving}
      />

      <TemplatePreviewDialog
        open={templatesTab.actions.previewOpen}
        onOpenChange={open => {
          if (!open) templatesTab.actions.onClosePreview();
        }}
        loading={templatesTab.actions.previewLoading}
        template={templatesTab.actions.previewData}
        canEdit={true}
        canDuplicate={true}
        onEdit={templatesTab.actions.onSwitchPreviewToEdit}
        onDuplicate={() => void templatesTab.actions.onDuplicateFromPreview()}
        duplicating={templatesTab.actions.duplicating}
      />

      <TemplateEditDialog
        open={templatesTab.actions.editOpen}
        onOpenChange={open => {
          if (!open) templatesTab.actions.onCloseEdit();
        }}
        loading={templatesTab.actions.editLoading}
        submitting={templatesTab.actions.editSubmitting}
        values={templatesTab.actions.editValues}
        errors={templatesTab.actions.editErrors}
        isPostTemplate={templatesTab.actions.editIsPost}
        advancedContentNotice={templatesTab.actions.editAdvancedNotice}
        onChange={templatesTab.actions.onEditChange}
        onSubmit={() => void templatesTab.actions.onEditSave()}
        canSubmit={
          !templatesTab.actions.editSubmitting && templatesTab.actions.editValues.displayName.trim().length >= 3
        }
      />

      <TemplateLibraryDialog
        open={templatesTab.library.open}
        onOpenChange={open => {
          if (!open) templatesTab.library.close();
        }}
        templateTypeLabel={templatesTab.library.templateTypeLabel}
        sections={templatesTab.library.sections}
        canLoadPlatform={templatesTab.library.canLoadPlatform}
        platformLoaded={templatesTab.library.platformLoaded}
        onLoadPlatform={templatesTab.library.onLoadPlatform}
        onSelect={tmpl => void templatesTab.library.onSelect(tmpl)}
        loadingSelect={templatesTab.library.loadingSelect}
      />

      <ImageCropDialog
        open={about.pendingCrop !== null}
        file={about.pendingCrop?.file}
        config={about.pendingCrop?.config ?? {}}
        onSave={({ file, altText }) => about.onCropComplete(file, altText)}
        onCancel={about.onCropCancel}
        saveLabel={t('about.branding.cropDialog.save', { defaultValue: 'Save' })}
        cancelLabel={t('about.branding.cropDialog.cancel', { defaultValue: 'Cancel' })}
        title={t('about.branding.cropDialog.title', { defaultValue: 'Crop Image' })}
        altTextLabel={t('about.branding.cropDialog.altText', { defaultValue: 'Description' })}
        altTextPlaceholder={t('about.branding.cropDialog.altTextPlaceholder', {
          defaultValue: 'Describe this image…',
        })}
      />

      <ConfirmationDialog
        open={subspacesTab.pendingDelete !== null}
        onOpenChange={open => {
          if (!open) subspacesTab.cancelDelete();
        }}
        variant="destructive"
        title={t('subspaces.deleteDialog.title', { defaultValue: 'Delete subspace' })}
        description={t('subspaces.deleteDialog.description', {
          defaultValue: 'Are you sure you want to delete "{{name}}"? This action cannot be undone.',
          name: subspacesTab.pendingDelete?.name ?? '',
        })}
        confirmLabel={t('subspaces.deleteDialog.confirm', { defaultValue: 'Delete' })}
        cancelLabel={t('dirtyGuard.cancel', { defaultValue: 'Cancel' })}
        onConfirm={subspacesTab.confirmDelete}
        onCancel={subspacesTab.cancelDelete}
      />

      <ConfirmationDialog
        open={templatesTab.pendingDelete !== null}
        onOpenChange={open => {
          if (!open) templatesTab.cancelDelete();
        }}
        variant="destructive"
        title={t('templates.deleteDialog.title', { defaultValue: 'Delete template' })}
        description={t('templates.deleteDialog.description', {
          defaultValue: 'Are you sure you want to delete "{{name}}"? This action cannot be undone.',
          name: templatesTab.pendingDelete?.name ?? '',
        })}
        confirmLabel={t('templates.deleteDialog.confirm', { defaultValue: 'Delete' })}
        cancelLabel={t('dirtyGuard.cancel', { defaultValue: 'Cancel' })}
        onConfirm={templatesTab.confirmDelete}
        onCancel={templatesTab.cancelDelete}
      />

      <ConfirmationDialog
        open={community.pendingRemoval !== null}
        onOpenChange={open => {
          if (!open) community.cancelRemoval();
        }}
        variant="destructive"
        title={(() => {
          switch (community.pendingRemoval?.kind) {
            case 'user':
              return t('community.confirmRemove.user.title', { defaultValue: 'Remove member' });
            case 'organization':
              return t('community.confirmRemove.organization.title', {
                defaultValue: 'Remove organization',
              });
            case 'virtualContributor':
              return t('community.confirmRemove.virtualContributor.title', {
                defaultValue: 'Remove virtual contributor',
              });
            case 'invitation':
            case 'platformInvitation':
              return t('community.confirmRemove.invitation.title', {
                defaultValue: 'Revoke invitation',
              });
            case 'applicationReject':
              return t('community.confirmRemove.applicationReject.title', {
                defaultValue: 'Reject application',
              });
            default:
              return '';
          }
        })()}
        description={(() => {
          const name = community.pendingRemoval?.name ?? '';
          switch (community.pendingRemoval?.kind) {
            case 'user':
              return t('community.confirmRemove.user.description', {
                defaultValue: 'Remove {{name}} from this space? They will lose access immediately.',
                name,
              });
            case 'organization':
              return t('community.confirmRemove.organization.description', {
                defaultValue: 'Remove {{name}} from this space?',
                name,
              });
            case 'virtualContributor':
              return t('community.confirmRemove.virtualContributor.description', {
                defaultValue: 'Remove {{name}} from this space?',
                name,
              });
            case 'invitation':
            case 'platformInvitation':
              return t('community.confirmRemove.invitation.description', {
                defaultValue: 'Revoke the pending invitation for {{name}}?',
                name,
              });
            case 'applicationReject':
              return t('community.confirmRemove.applicationReject.description', {
                defaultValue: "Reject {{name}}'s application to join this space?",
                name,
              });
            default:
              return '';
          }
        })()}
        confirmLabel={t('community.confirmRemove.confirm', { defaultValue: 'Confirm' })}
        cancelLabel={t('dirtyGuard.cancel', { defaultValue: 'Cancel' })}
        onConfirm={() => void community.confirmRemoval()}
        onCancel={community.cancelRemoval}
      />

      <AddCommunityMemberDialog
        open={addOrgDialog.open}
        onOpenChange={open => {
          if (!open) addOrgDialog.closeDialog();
        }}
        title={t('community.organizations.addDialog.title', { defaultValue: 'Add Organization' })}
        description={t('community.organizations.addDialog.description', {
          defaultValue: 'Pick an organization whose members can join this space without approval.',
        })}
        searchPlaceholder={t('community.organizations.addDialog.search', {
          defaultValue: 'Search organizations…',
        })}
        candidates={addOrgDialog.candidates}
        loading={addOrgDialog.loading}
        search={addOrgDialog.search}
        addedIds={addOrgDialog.addedIds}
        addingId={addOrgDialog.addingId}
        emptyLabel={t('community.organizations.addDialog.empty', {
          defaultValue: 'No organizations match your search.',
        })}
        onSearchChange={addOrgDialog.onSearchChange}
        onAdd={id => void addOrgDialog.onAdd(id)}
      />

      <AddCommunityMemberDialog
        open={addVCDialog.open}
        onOpenChange={open => {
          if (!open) addVCDialog.closeDialog();
        }}
        title={t('community.virtualContributors.addDialog.title', { defaultValue: 'Add Virtual Contributor' })}
        description={t('community.virtualContributors.addDialog.description', {
          defaultValue: 'Pick a virtual contributor from this account to add to the space.',
        })}
        searchPlaceholder={t('community.virtualContributors.addDialog.search', {
          defaultValue: 'Search virtual contributors…',
        })}
        candidates={addVCDialog.candidates}
        loading={addVCDialog.loading}
        search={addVCDialog.search}
        addedIds={addVCDialog.addedIds}
        addingId={addVCDialog.addingId}
        emptyLabel={t('community.virtualContributors.addDialog.empty', {
          defaultValue: 'No virtual contributors available on this account.',
        })}
        onSearchChange={addVCDialog.onSearchChange}
        onAdd={id => void addVCDialog.onAdd(id)}
      />

      <AddCommunityMemberDialog
        open={addVCExternalDialog.open}
        onOpenChange={open => {
          if (!open) addVCExternalDialog.closeDialog();
        }}
        title={t('community.virtualContributors.addExternalDialog.title', {
          defaultValue: 'Invite External Virtual Contributor',
        })}
        description={t('community.virtualContributors.addExternalDialog.description', {
          defaultValue:
            'Invite a virtual contributor from the Alkemio library. The owner will have to accept the invitation.',
        })}
        searchPlaceholder={t('community.virtualContributors.addExternalDialog.search', {
          defaultValue: 'Search the library…',
        })}
        candidates={addVCExternalDialog.candidates}
        loading={addVCExternalDialog.loading}
        search={addVCExternalDialog.search}
        addedIds={addVCExternalDialog.addedIds}
        addingId={addVCExternalDialog.addingId}
        emptyLabel={t('community.virtualContributors.addExternalDialog.empty', {
          defaultValue: 'No library virtual contributors match your search.',
        })}
        onSearchChange={addVCExternalDialog.onSearchChange}
        onAdd={id => void addVCExternalDialog.onAdd(id)}
      />

      <InviteMembersDialog
        open={inviteDialog.open}
        onOpenChange={open => {
          if (!open) inviteDialog.closeDialog();
        }}
        candidates={inviteDialog.candidates}
        loading={inviteDialog.loading}
        search={inviteDialog.search}
        addedIds={inviteDialog.addedIds}
        addingId={inviteDialog.addingId}
        inviting={inviteDialog.inviting}
        onSearchChange={inviteDialog.onSearchChange}
        onInviteUser={id => void inviteDialog.onAdd(id)}
        onInviteEmail={email => inviteDialog.inviteByEmail(email)}
      />

      <ConfirmationDialog
        open={storageTab.pendingDelete !== null}
        onOpenChange={open => {
          if (!open) storageTab.cancelDelete();
        }}
        variant="destructive"
        title={t('storage.deleteDialog.title', { defaultValue: 'Delete document' })}
        description={t('storage.deleteDialog.description', {
          defaultValue: 'Are you sure you want to delete "{{name}}"? This action cannot be undone.',
          name: storageTab.pendingDelete?.name ?? '',
        })}
        confirmLabel={t('storage.deleteDialog.confirm', { defaultValue: 'Delete' })}
        cancelLabel={t('dirtyGuard.cancel', { defaultValue: 'Cancel' })}
        onConfirm={storageTab.confirmDelete}
        onCancel={storageTab.cancelDelete}
      />

      <ConfirmationDialog
        open={accountTab.pendingDeleteSpace}
        onOpenChange={open => {
          if (!open) accountTab.cancelDeleteSpace();
        }}
        variant="destructive"
        title={t('account.dangerZone.deleteDialog.title', { defaultValue: 'Delete Space' })}
        description={t('account.dangerZone.deleteDialog.description', {
          defaultValue: 'This will permanently delete this space and all its content. This action cannot be undone.',
        })}
        confirmLabel={t('account.dangerZone.deleteDialog.confirm', { defaultValue: 'Delete Space' })}
        cancelLabel={t('dirtyGuard.cancel', { defaultValue: 'Cancel' })}
        onConfirm={accountTab.confirmDeleteSpace}
        onCancel={accountTab.cancelDeleteSpace}
      />

      <ConfirmationDialog
        open={about.pendingReferenceDelete !== null}
        onOpenChange={open => {
          if (!open) about.onCancelRemoveReference();
        }}
        variant="destructive"
        title={t('about.references.deleteDialog.title', { defaultValue: 'Remove reference' })}
        description={t('about.references.deleteDialog.description', {
          defaultValue: 'Are you sure you want to remove "{{name}}"? This cannot be undone once you Save.',
          name:
            about.pendingReferenceDelete?.title ||
            t('about.references.deleteDialog.untitled', {
              defaultValue: 'this reference',
            }),
        })}
        confirmLabel={t('about.references.deleteDialog.confirm', { defaultValue: 'Remove' })}
        cancelLabel={t('dirtyGuard.cancel', { defaultValue: 'Cancel' })}
        onConfirm={about.onConfirmRemoveReference}
        onCancel={about.onCancelRemoveReference}
      />

      <ConfirmationDialog
        open={layoutDiscardOpen}
        onOpenChange={setLayoutDiscardOpen}
        variant="destructive"
        title={t('layout.discardChangesDialog.title', { defaultValue: 'Discard changes?' })}
        description={t('layout.discardChangesDialog.description', {
          defaultValue: 'Your unsaved Layout changes will be reverted to the last saved state. This cannot be undone.',
        })}
        confirmLabel={t('layout.discardChangesDialog.confirm', { defaultValue: 'Discard Changes' })}
        cancelLabel={t('dirtyGuard.cancel', { defaultValue: 'Cancel' })}
        onConfirm={handleLayoutDiscardConfirm}
        onCancel={() => setLayoutDiscardOpen(false)}
      />

      <ConfirmationDialog
        open={guard.pendingSwitch !== null}
        onOpenChange={open => {
          if (!open) handleConfirmSwitchCancel();
        }}
        variant="discard"
        title={t('dirtyGuard.tabSwitch.title', { defaultValue: 'Unsaved changes' })}
        description={t('dirtyGuard.tabSwitch.description', {
          defaultValue: 'You have unsaved changes on this tab. Save them, discard them, or stay on this tab?',
        })}
        saveLabel={t('dirtyGuard.save', { defaultValue: 'Save' })}
        discardLabel={t('dirtyGuard.discard', { defaultValue: 'Discard & leave' })}
        cancelLabel={t('dirtyGuard.cancel', { defaultValue: 'Cancel' })}
        onSave={handleConfirmSwitchSave}
        onDiscard={handleConfirmSwitchDiscard}
        onCancel={handleConfirmSwitchCancel}
      />
    </div>
  );
}
