import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { ImageCropDialog } from '@/crd/components/common/ImageCropDialog';
import { LoadingSpinner } from '@/crd/components/common/LoadingSpinner';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { AddCommunityMemberDialog } from '@/crd/components/space/settings/AddCommunityMemberDialog';
import { ApplicationFormEditor } from '@/crd/components/space/settings/ApplicationFormEditor';
import { ChangeDefaultSubspaceTemplateDialog } from '@/crd/components/space/settings/ChangeDefaultSubspaceTemplateDialog';
import { CommunityGuidelinesEditor } from '@/crd/components/space/settings/CommunityGuidelinesEditor';
import { CreateSubspaceDialog } from '@/crd/components/space/settings/CreateSubspaceDialog';
import { InviteMembersDialog } from '@/crd/components/space/settings/InviteMembersDialog';
import { MemberSettingsDialog } from '@/crd/components/space/settings/MemberSettingsDialog';
import type { MemberSettingsSubject } from '@/crd/components/space/settings/memberSettingsTypes';
import { SaveSubspaceAsTemplateDialog } from '@/crd/components/space/settings/SaveSubspaceAsTemplateDialog';
import { SpaceSettingsAboutView } from '@/crd/components/space/settings/SpaceSettingsAboutView';
import { SpaceSettingsAccountView } from '@/crd/components/space/settings/SpaceSettingsAccountView';
import type { CommunityMember, CommunityOrg } from '@/crd/components/space/settings/SpaceSettingsCommunityView';
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
import { useSettingsScope } from './useSettingsScope';
import { useSpaceSettingsTab } from './useSpaceSettingsTab';
import { getVisibleSettingsTabs } from './useVisibleSettingsTabs';

/**
 * CrdSpaceSettingsPage — route entry for the CRD Space Settings area.
 *
 * Renders the horizontal tab strip + the active tab's panel. The CRD space
 * hero is provided by the enclosing `CrdSpacePageLayout` — we intentionally do
 * NOT render a second hero here.
 */
export default function CrdSpaceSettingsPage() {
  const { t, i18n } = useTranslation('crd-spaceSettings');
  const scope = useSettingsScope();
  const { id: spaceId, level, url: spaceUrl, roleSetId, communityId, accountId, loading: scopeLoading } = scope;
  const visibleTabs = getVisibleSettingsTabs(level);
  const { activeTab, setActiveTab } = useSpaceSettingsTab(visibleTabs);
  const guard = useDirtyTabGuard();

  const isTabVisible = (id: (typeof visibleTabs)[number]) => visibleTabs.includes(id);

  const about = useAboutTabData(spaceId, spaceUrl);
  const layout = useLayoutTabData(spaceId);
  const community = useCommunityTabData(roleSetId);
  const subspacesTab = useSubspacesTabData(isTabVisible('subspaces') ? spaceId : '');
  const createSubspace = useCreateSubspace(spaceId);
  const saveAsTemplate = useSaveSubspaceAsTemplate({
    templatesSetId: subspacesTab.templatesSetId,
    onSaved: () => subspacesTab.closeSaveAsTemplate(),
  });
  const templatesTab = useTemplatesTabData(isTabVisible('templates') ? spaceId : '', accountId || undefined);
  const storageTab = useStorageTabData(isTabVisible('storage') ? spaceId : '');
  const settingsTab = useSettingsTabData(spaceId);
  const applicationForm = useApplicationFormData(settingsTab.roleSetId);
  const accountTab = useAccountTabData(isTabVisible('account') ? spaceId : '');
  const updatesTab = useUpdatesTabData(communityId || undefined);
  const communityGuidelinesId = scope.guidelinesId;
  const communityGuidelines = useCommunityGuidelinesData(communityGuidelinesId);
  const addOrgDialog = useAddOrganizationDialog({ community: community._adminRef });
  const addVCDialog = useAddVirtualContributorDialog({
    community: community._adminRef,
    spaceId,
    spaceLevel: level === 'L0' ? SpaceLevel.L0 : level === 'L1' ? SpaceLevel.L1 : SpaceLevel.L2,
  });
  const addVCExternalDialog = useAddVirtualContributorExternalDialog({
    community: community._adminRef,
    spaceId,
    spaceLevel: level === 'L0' ? SpaceLevel.L0 : level === 'L1' ? SpaceLevel.L1 : SpaceLevel.L2,
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
    onDeleteState: level !== 'L0' ? layout.onDeleteState : undefined,
    columnCount: layout.columns.length,
    minimumNumberOfStates: layout.minimumNumberOfStates,
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

  // Member settings dialog state — owns the active subject so the dialog can be
  // re-mounted instantly when the admin switches between rows. The Remove flow
  // reuses the existing community.pendingRemoval / ConfirmationDialog plumbing
  // below; `removeOriginatedFromDialog` lets us close the Member settings dialog
  // (in addition to the confirmation prompt) when the removal succeeds AND the
  // flow originated from inside the dialog itself (FR-Story-3 AC #3 + AC #2).
  const [activeMemberSubject, setActiveMemberSubject] = useState<MemberSettingsSubject | null>(null);
  const [removeOriginatedFromDialog, setRemoveOriginatedFromDialog] = useState(false);

  const buildUserSubject = (m: CommunityMember): MemberSettingsSubject => ({
    type: 'user',
    id: m.id,
    displayName: m.displayName,
    firstName: community.getMemberFirstName(m.id),
    avatarUrl: m.avatarUrl,
    isLead: m.isLead,
    isAdmin: m.isAdmin,
  });
  const buildOrgSubject = (org: CommunityOrg): MemberSettingsSubject => ({
    type: 'organization',
    id: org.id,
    displayName: org.displayName,
    avatarUrl: org.avatarUrl,
    isLead: org.isLead,
  });

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
    applicationForm.onReset();
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

  const bootstrapping = scopeLoading || !spaceId;

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
                  level={level}
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
                level={level}
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
                onCreatePhase={level !== 'L0' ? layout.onCreateState : undefined}
                maximumNumberOfStates={layout.maximumNumberOfStates}
                isStructureMutating={layout.isStructureMutating}
              />
            )}
            {activeTab === 'community' && (
              <SpaceSettingsCommunityView
                level={level}
                members={community.members}
                pendingMemberships={community.pendingMemberships}
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
                onMemberChangeRole={member => setActiveMemberSubject(buildUserSubject(member))}
                onOrgAdd={addOrgDialog.openDialog}
                onOrgRemove={community.onOrgRemove}
                onOrgChangeRole={org => setActiveMemberSubject(buildOrgSubject(org))}
                onVCAdd={addVCDialog.openDialog}
                onVCAddExternal={addVCExternalDialog.openDialog}
                onVCRemove={community.onVCRemove}
                onPendingApprove={community.onPendingApprove}
                onPendingReject={community.onPendingReject}
                onPendingDelete={community.onPendingDelete}
                onInviteUsers={inviteDialog.openDialog}
              />
            )}
            {activeTab === 'subspaces' && isTabVisible('subspaces') && (
              <SpaceSettingsSubspacesView
                subspaces={subspacesTab.subspaces}
                canCreate={subspacesTab.canCreate}
                canSaveAsTemplate={subspacesTab.canSaveAsTemplate && level === 'L0'}
                loading={subspacesTab.loading}
                onCreate={() => createSubspace.openDialog()}
                onChangeDefaultTemplate={level === 'L0' ? subspacesTab.onChangeDefaultTemplate : undefined}
                onKebabAction={subspacesTab.onKebabAction}
              />
            )}
            {activeTab === 'templates' && isTabVisible('templates') && (
              <SpaceSettingsTemplatesView
                categories={templatesTab.categories}
                loading={templatesTab.loading}
                duplicatingCategory={templatesTab.actions.duplicatingCategory ?? templatesTab.library.importingCategory}
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
                locale={i18n.language}
                onDraftChange={updatesTab.onDraftChange}
                onSubmit={() => void updatesTab.onSubmit()}
                onRequestRemove={updatesTab.onRequestRemove}
              />
            )}
            {activeTab === 'storage' && isTabVisible('storage') && (
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
                level={level}
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
            {activeTab === 'account' && isTabVisible('account') && (
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
                onCopyUrl={accountTab.onCopyUrl}
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
        title={t('updates.deleteDialog.title')}
        description={t('updates.deleteDialog.description')}
        confirmLabel={t('updates.deleteDialog.confirm')}
        cancelLabel={t('dirtyGuard.cancel')}
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
        saveLabel={t('about.branding.cropDialog.save')}
        savingLabel={t('about.branding.cropDialog.saving')}
        cancelLabel={t('about.branding.cropDialog.cancel')}
        title={t('about.branding.cropDialog.title')}
        altTextLabel={t('about.branding.cropDialog.altText')}
        altTextPlaceholder={t('about.branding.cropDialog.altTextPlaceholder')}
      />

      <ConfirmationDialog
        open={subspacesTab.pendingDelete !== null}
        onOpenChange={open => {
          if (!open) subspacesTab.cancelDelete();
        }}
        variant="destructive"
        title={t('subspaces.deleteDialog.title')}
        description={t('subspaces.deleteDialog.description', { name: subspacesTab.pendingDelete?.name ?? '' })}
        confirmLabel={t('subspaces.deleteDialog.confirm')}
        cancelLabel={t('dirtyGuard.cancel')}
        onConfirm={subspacesTab.confirmDelete}
        onCancel={subspacesTab.cancelDelete}
      />

      <ConfirmationDialog
        open={templatesTab.pendingDelete !== null}
        onOpenChange={open => {
          if (!open && !templatesTab.deleting) templatesTab.cancelDelete();
        }}
        variant="destructive"
        title={t('templates.deleteDialog.title')}
        description={t('templates.deleteDialog.description', { name: templatesTab.pendingDelete?.name ?? '' })}
        confirmLabel={t('templates.deleteDialog.confirm')}
        cancelLabel={t('dirtyGuard.cancel')}
        onConfirm={templatesTab.confirmDelete}
        onCancel={templatesTab.cancelDelete}
        loading={templatesTab.deleting}
      />

      <ConfirmationDialog
        open={community.pendingRemoval !== null}
        onOpenChange={open => {
          if (!open) {
            community.cancelRemoval();
            setRemoveOriginatedFromDialog(false);
          }
        }}
        variant="destructive"
        title={(() => {
          switch (community.pendingRemoval?.kind) {
            case 'user':
              return t('community.confirmRemove.user.title');
            case 'organization':
              return t('community.confirmRemove.organization.title');
            case 'virtualContributor':
              return t('community.confirmRemove.virtualContributor.title');
            case 'applicationReject':
              return t('community.confirmRemove.applicationReject.title');
            case 'pendingDelete':
              if (community.pendingRemoval.membershipType === 'application') {
                return t('community.confirmRemove.applicationDelete.title');
              }
              return t('community.confirmRemove.invitation.title');
            default:
              return '';
          }
        })()}
        description={(() => {
          const name = community.pendingRemoval?.name ?? '';
          switch (community.pendingRemoval?.kind) {
            case 'user':
              return t('community.confirmRemove.user.description', { name });
            case 'organization':
              return t('community.confirmRemove.organization.description', { name });
            case 'virtualContributor':
              return t('community.confirmRemove.virtualContributor.description', { name });
            case 'applicationReject':
              return t('community.confirmRemove.applicationReject.description', { name });
            case 'pendingDelete':
              if (community.pendingRemoval.membershipType === 'application') {
                return t('community.confirmRemove.applicationDelete.description', { name });
              }
              return t('community.confirmRemove.invitation.description', { name });
            default:
              return '';
          }
        })()}
        confirmLabel={t('community.confirmRemove.confirm')}
        cancelLabel={t('dirtyGuard.cancel')}
        onConfirm={async () => {
          await community.confirmRemoval();
          if (removeOriginatedFromDialog) {
            setActiveMemberSubject(null);
            setRemoveOriginatedFromDialog(false);
          }
        }}
        onCancel={() => {
          community.cancelRemoval();
          setRemoveOriginatedFromDialog(false);
        }}
      />

      {activeMemberSubject && (
        <MemberSettingsDialog
          open={true}
          onOpenChange={open => {
            if (!open) setActiveMemberSubject(null);
          }}
          subject={activeMemberSubject}
          leadGate={
            activeMemberSubject.type === 'user'
              ? {
                  canAddLead: community.leadPolicy.canAddLeadUser,
                  canRemoveLead: community.leadPolicy.canRemoveLeadUser,
                }
              : {
                  canAddLead: community.leadPolicy.canAddLeadOrganization,
                  canRemoveLead: community.leadPolicy.canRemoveLeadOrganization,
                }
          }
          onLeadChange={(id, isLead) =>
            activeMemberSubject.type === 'user'
              ? community.onUserLeadChange(id, isLead)
              : community.onOrgLeadChange(id, isLead)
          }
          onAdminChange={
            activeMemberSubject.type === 'user' ? (id, isAdmin) => community.onUserAdminChange(id, isAdmin) : undefined
          }
          onRemoveMember={
            community.viewerId === activeMemberSubject.id
              ? undefined
              : id => {
                  setRemoveOriginatedFromDialog(true);
                  if (activeMemberSubject.type === 'user') {
                    community.onUserRemove(id);
                  } else {
                    community.onOrgRemove(id);
                  }
                }
          }
        />
      )}

      <AddCommunityMemberDialog
        open={addOrgDialog.open}
        onOpenChange={open => {
          if (!open) addOrgDialog.closeDialog();
        }}
        title={t('community.organizations.addDialog.title')}
        description={t('community.organizations.addDialog.description')}
        searchPlaceholder={t('community.organizations.addDialog.search')}
        candidates={addOrgDialog.candidates}
        loading={addOrgDialog.loading}
        search={addOrgDialog.search}
        addedIds={addOrgDialog.addedIds}
        addingId={addOrgDialog.addingId}
        emptyLabel={t('community.organizations.addDialog.empty')}
        onSearchChange={addOrgDialog.onSearchChange}
        onAdd={id => void addOrgDialog.onAdd(id)}
      />

      <AddCommunityMemberDialog
        open={addVCDialog.open}
        onOpenChange={open => {
          if (!open) addVCDialog.closeDialog();
        }}
        title={t('community.virtualContributors.addDialog.title')}
        description={t('community.virtualContributors.addDialog.description')}
        searchPlaceholder={t('community.virtualContributors.addDialog.search')}
        candidates={addVCDialog.candidates}
        loading={addVCDialog.loading}
        search={addVCDialog.search}
        addedIds={addVCDialog.addedIds}
        addingId={addVCDialog.addingId}
        emptyLabel={t('community.virtualContributors.addDialog.empty')}
        onSearchChange={addVCDialog.onSearchChange}
        onAdd={id => void addVCDialog.onAdd(id)}
      />

      <AddCommunityMemberDialog
        open={addVCExternalDialog.open}
        onOpenChange={open => {
          if (!open) addVCExternalDialog.closeDialog();
        }}
        title={t('community.virtualContributors.addExternalDialog.title')}
        description={t('community.virtualContributors.addExternalDialog.description')}
        searchPlaceholder={t('community.virtualContributors.addExternalDialog.search')}
        candidates={addVCExternalDialog.candidates}
        loading={addVCExternalDialog.loading}
        search={addVCExternalDialog.search}
        addedIds={addVCExternalDialog.addedIds}
        addingId={addVCExternalDialog.addingId}
        emptyLabel={t('community.virtualContributors.addExternalDialog.empty')}
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
        title={t('storage.deleteDialog.title')}
        description={t('storage.deleteDialog.description', { name: storageTab.pendingDelete?.name ?? '' })}
        confirmLabel={t('storage.deleteDialog.confirm')}
        cancelLabel={t('dirtyGuard.cancel')}
        onConfirm={storageTab.confirmDelete}
        onCancel={storageTab.cancelDelete}
      />

      <ConfirmationDialog
        open={accountTab.pendingDeleteSpace}
        onOpenChange={open => {
          if (!open) accountTab.cancelDeleteSpace();
        }}
        variant="destructive"
        title={t('account.dangerZone.deleteDialog.title')}
        description={t('account.dangerZone.deleteDialog.description')}
        confirmLabel={t('account.dangerZone.deleteDialog.confirm')}
        cancelLabel={t('dirtyGuard.cancel')}
        onConfirm={accountTab.confirmDeleteSpace}
        onCancel={accountTab.cancelDeleteSpace}
      />

      <ConfirmationDialog
        open={about.pendingReferenceDelete !== null}
        onOpenChange={open => {
          if (!open) about.onCancelRemoveReference();
        }}
        variant="destructive"
        title={t('about.references.deleteDialog.title')}
        description={t('about.references.deleteDialog.description', {
          name: about.pendingReferenceDelete?.title || t('about.references.deleteDialog.untitled'),
        })}
        confirmLabel={t('about.references.deleteDialog.confirm')}
        cancelLabel={t('dirtyGuard.cancel')}
        onConfirm={about.onConfirmRemoveReference}
        onCancel={about.onCancelRemoveReference}
      />

      <ConfirmationDialog
        open={layoutDiscardOpen}
        onOpenChange={setLayoutDiscardOpen}
        variant="destructive"
        title={t('layout.discardChangesDialog.title')}
        description={t('layout.discardChangesDialog.description')}
        confirmLabel={t('layout.discardChangesDialog.confirm')}
        cancelLabel={t('dirtyGuard.cancel')}
        onConfirm={handleLayoutDiscardConfirm}
        onCancel={() => setLayoutDiscardOpen(false)}
      />

      <ConfirmationDialog
        open={guard.pendingSwitch !== null}
        onOpenChange={open => {
          if (!open) handleConfirmSwitchCancel();
        }}
        variant="discard"
        title={t('dirtyGuard.tabSwitch.title')}
        description={t('dirtyGuard.tabSwitch.description')}
        saveLabel={t('dirtyGuard.save')}
        discardLabel={t('dirtyGuard.discard')}
        cancelLabel={t('dirtyGuard.cancel')}
        onSave={handleConfirmSwitchSave}
        onDiscard={handleConfirmSwitchDiscard}
        onCancel={handleConfirmSwitchCancel}
      />
    </div>
  );
}
