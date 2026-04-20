import {
  Bookmark,
  HardDrive,
  Info,
  Layers,
  LayoutGrid,
  Settings as SettingsIcon,
  UserCircle,
  Users,
} from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ImageCropDialog } from '@/crd/components/common/ImageCropDialog';
import { LoadingSpinner } from '@/crd/components/common/LoadingSpinner';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { ApplicationFormEditor } from '@/crd/components/space/settings/ApplicationFormEditor';
import { SpaceSettingsAboutView } from '@/crd/components/space/settings/SpaceSettingsAboutView';
import { SpaceSettingsAccountView } from '@/crd/components/space/settings/SpaceSettingsAccountView';
import { SpaceSettingsCommunityView } from '@/crd/components/space/settings/SpaceSettingsCommunityView';
import { SpaceSettingsLayoutView } from '@/crd/components/space/settings/SpaceSettingsLayoutView';
import { SpaceSettingsSettingsView } from '@/crd/components/space/settings/SpaceSettingsSettingsView';
import { SpaceSettingsStorageView } from '@/crd/components/space/settings/SpaceSettingsStorageView';
import { SpaceSettingsSubspacesView } from '@/crd/components/space/settings/SpaceSettingsSubspacesView';
import {
  type SpaceSettingsTabDescriptor,
  SpaceSettingsTabStrip,
} from '@/crd/components/space/settings/SpaceSettingsTabStrip';
import { SpaceSettingsTemplatesView } from '@/crd/components/space/settings/SpaceSettingsTemplatesView';
import { COUNTRIES } from '@/domain/common/location/countries.constants';
import { useSpace } from '@/domain/space/context/useSpace';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { useAboutTabData } from './about/useAboutTabData';
import { useAccountTabData } from './account/useAccountTabData';
import { useCommunityTabData } from './community/useCommunityTabData';
import { useColumnMenu } from './layout/useColumnMenu';
import { useLayoutTabData } from './layout/useLayoutTabData';
import { useApplicationFormData } from './settings/useApplicationFormData';
import { useSettingsTabData } from './settings/useSettingsTabData';
import { useStorageTabData } from './storage/useStorageTabData';
import { useSubspacesTabData } from './subspaces/useSubspacesTabData';
import { useTemplatesTabData } from './templates/useTemplatesTabData';
import { useDirtyTabGuard } from './useDirtyTabGuard';
import { type SpaceSettingsTabId, useSpaceSettingsTab } from './useSpaceSettingsTab';

/**
 * CrdSpaceSettingsPage — route entry for the CRD Space Settings area.
 *
 * Renders the horizontal tab strip + the active tab's panel. The CRD space
 * hero is provided by the enclosing `CrdSpacePageLayout` — we intentionally do
 * NOT render a second hero here.
 */
export default function CrdSpaceSettingsPage() {
  const { t } = useTranslation('crd-spaceSettings');
  const { spaceId, loading: resolvingUrl } = useUrlResolver();
  const { space, loading: loadingSpace } = useSpace();
  const { activeTab, setActiveTab } = useSpaceSettingsTab();
  const guard = useDirtyTabGuard();

  const tabs: ReadonlyArray<SpaceSettingsTabDescriptor<SpaceSettingsTabId>> = [
    { id: 'about', label: t('tabs.about', { defaultValue: 'About' }), icon: Info },
    { id: 'layout', label: t('tabs.layout', { defaultValue: 'Layout' }), icon: LayoutGrid },
    { id: 'community', label: t('tabs.community', { defaultValue: 'Community' }), icon: Users },
    { id: 'subspaces', label: t('tabs.subspaces', { defaultValue: 'Subspaces' }), icon: Layers },
    { id: 'templates', label: t('tabs.templates', { defaultValue: 'Templates' }), icon: Bookmark },
    { id: 'storage', label: t('tabs.storage', { defaultValue: 'Storage' }), icon: HardDrive },
    { id: 'settings', label: t('tabs.settings', { defaultValue: 'Settings' }), icon: SettingsIcon },
    { id: 'account', label: t('tabs.account', { defaultValue: 'Account' }), icon: UserCircle },
  ];

  const spaceUrl = space?.about.profile.url ?? '';
  const roleSetId = space?.about.membership?.roleSetID ?? '';
  const about = useAboutTabData(spaceId ?? '', spaceUrl);
  const layout = useLayoutTabData(spaceId ?? '');
  const community = useCommunityTabData(roleSetId);
  const subspacesTab = useSubspacesTabData(spaceId ?? '');
  const templatesTab = useTemplatesTabData(spaceId ?? '');
  const storageTab = useStorageTabData(spaceId ?? '');
  const settingsTab = useSettingsTabData(spaceId ?? '');
  const applicationForm = useApplicationFormData(settingsTab.roleSetId);
  const accountTab = useAccountTabData(spaceId ?? '');
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

  // Sync dirty flag from About + Layout + Application Form to the guard so tab-switching shows confirm.
  useEffect(() => {
    if (layout.isDirty || about.isDirty || applicationForm.isDirty) {
      guard.markDirty();
    } else {
      guard.clearDirty();
    }
  }, [guard, layout.isDirty, about.isDirty, applicationForm.isDirty]);

  // No-op cleanup — autosave was removed.
  useEffect(() => {
    const previous = activeTab;
    return () => {
      void previous;
    };
  }, [activeTab, about]);

  const onTabChange = async (next: SpaceSettingsTabId) => {
    const allowed = await guard.requestSwitch(next);
    if (allowed) {
      setActiveTab(next);
    }
  };

  const handleConfirmSwitchSave = async () => {
    if (about.isDirty) await about.onSave();
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
    about.onReset();
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

  const bootstrapping = resolvingUrl || loadingSpace || !spaceId;

  return (
    <div className="flex flex-col gap-4">
      <SpaceSettingsTabStrip activeTab={activeTab} onTabChange={onTabChange} tabs={tabs} />
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
                  saveBar={about.saveBar}
                  countries={COUNTRIES}
                  onChange={about.onChange}
                  onUploadAvatar={about.onUploadAvatar}
                  onUploadPageBanner={about.onUploadPageBanner}
                  onUploadCardBanner={about.onUploadCardBanner}
                  onAddReference={about.onAddReference}
                  onUpdateReference={about.onUpdateReference}
                  onRemoveReference={about.onRemoveReference}
                  onSave={() => void about.onSave()}
                  onReset={about.onReset}
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
                onReset={layout.onReset}
                columnMenuActions={columnMenu}
              />
            )}
            {activeTab === 'community' && (
              <SpaceSettingsCommunityView
                users={community.users}
                organizations={community.organizations}
                virtualContributors={community.virtualContributors}
                applications={community.applications}
                invitations={community.invitations}
                permissions={community.permissions}
                onUserLeadChange={community.onUserLeadChange}
                onUserAdminChange={community.onUserAdminChange}
                onUserRemove={community.onUserRemove}
                onOrgLeadChange={community.onOrgLeadChange}
                onOrgRemove={community.onOrgRemove}
                onVCRemove={community.onVCRemove}
                onApplicationApprove={community.onApplicationApprove}
                onApplicationReject={community.onApplicationReject}
                onInvitationDelete={community.onInvitationDelete}
                onPlatformInvitationDelete={community.onPlatformInvitationDelete}
                onInviteUsers={() => {
                  // TODO: open invite dialog
                }}
              />
            )}
            {activeTab === 'subspaces' && (
              <SpaceSettingsSubspacesView
                subspaces={subspacesTab.subspaces}
                canCreate={subspacesTab.canCreate}
                canSaveAsTemplate={subspacesTab.canSaveAsTemplate}
                loading={subspacesTab.loading}
                onCreate={() => {
                  // TODO: open subspace creation dialog
                }}
                onChangeDefaultTemplate={subspacesTab.onChangeDefaultTemplate}
                onKebabAction={subspacesTab.onKebabAction}
              />
            )}
            {activeTab === 'templates' && (
              <SpaceSettingsTemplatesView
                categories={templatesTab.categories}
                loading={templatesTab.loading}
                onCreateTemplate={templatesTab.onCreateTemplate}
                onImportTemplate={templatesTab.onImportTemplate}
                onTemplateAction={templatesTab.onTemplateAction}
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
                canDeleteSpace={settingsTab.canDeleteSpace}
                loading={settingsTab.loading}
                updatingKeys={settingsTab.updatingKeys}
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
                onPrivacyChange={settingsTab.onPrivacyChange}
                onMembershipPolicyChange={settingsTab.onMembershipPolicyChange}
                onToggleAllowedAction={settingsTab.onToggleAllowedAction}
                onHostOrgTrustChange={settingsTab.onHostOrgTrustChange}
                onDeleteSpace={settingsTab.onDeleteSpace}
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
        open={settingsTab.pendingDeleteSpace}
        onOpenChange={open => {
          if (!open) settingsTab.cancelDeleteSpace();
        }}
        variant="destructive"
        title={t('settings.dangerZone.deleteDialog.title', { defaultValue: 'Delete Space' })}
        description={t('settings.dangerZone.deleteDialog.description', {
          defaultValue:
            'This will permanently delete this space, all subspaces, posts, documents, and community members. This action cannot be undone.',
        })}
        confirmLabel={t('settings.dangerZone.deleteDialog.confirm', { defaultValue: 'Delete Space' })}
        cancelLabel={t('dirtyGuard.cancel', { defaultValue: 'Cancel' })}
        onConfirm={settingsTab.confirmDeleteSpace}
        onCancel={settingsTab.cancelDeleteSpace}
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
