import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSpaceTemplatesManagerQuery } from '@/core/apollo/generated/apollo-hooks';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { ImageCropDialog } from '@/crd/components/common/ImageCropDialog';
import { LoadingSpinner } from '@/crd/components/common/LoadingSpinner';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { AddCommunityMemberDialog } from '@/crd/components/space/settings/AddCommunityMemberDialog';
import { ApplicationFormEditor } from '@/crd/components/space/settings/ApplicationFormEditor';
import { ChangeDefaultSubspaceTemplateDialog } from '@/crd/components/space/settings/ChangeDefaultSubspaceTemplateDialog';
import { CommunityGuidelinesEditor } from '@/crd/components/space/settings/CommunityGuidelinesEditor';
import { CreateSubspaceDialog } from '@/crd/components/space/settings/CreateSubspaceDialog';
import { MemberSettingsDialog } from '@/crd/components/space/settings/MemberSettingsDialog';
import type { MemberSettingsSubject } from '@/crd/components/space/settings/memberSettingsTypes';
import { SpaceSettingsAboutView } from '@/crd/components/space/settings/SpaceSettingsAboutView';
import { SpaceSettingsAccountView } from '@/crd/components/space/settings/SpaceSettingsAccountView';
import type { CommunityMember, CommunityOrg } from '@/crd/components/space/settings/SpaceSettingsCommunityView';
import { SpaceSettingsCommunityView } from '@/crd/components/space/settings/SpaceSettingsCommunityView';
import { SpaceSettingsLayoutView } from '@/crd/components/space/settings/SpaceSettingsLayoutView';
import { SpaceSettingsSettingsView } from '@/crd/components/space/settings/SpaceSettingsSettingsView';
import { SpaceSettingsStorageView } from '@/crd/components/space/settings/SpaceSettingsStorageView';
import { SpaceSettingsSubspacesView } from '@/crd/components/space/settings/SpaceSettingsSubspacesView';
import { SpaceSettingsUpdatesView } from '@/crd/components/space/settings/SpaceSettingsUpdatesView';
import { TemplateFormDialog } from '@/crd/components/templates/TemplateFormDialog';
import { TemplatePicker } from '@/crd/components/templates/TemplatePicker';
import { COUNTRIES } from '@/domain/common/location/countries.constants';
import { useMarkdownEditorIntegration } from '@/main/crdPages/markdown/useMarkdownEditorIntegration';
import { InviteMembersDialogConnector } from '@/main/crdPages/space/dialogs/InviteMembersDialogConnector';
import { useSaveAsTemplate } from '@/main/crdPages/templates/useSaveAsTemplate';
import { useTemplatePicker } from '@/main/crdPages/templates/useTemplatePicker';
import { LayoutReplaceFlowConnector } from '../../space/innovationFlow/LayoutReplaceFlowConnector';
import { useAboutTabData } from './about/useAboutTabData';
import { useAccountTabData } from './account/useAccountTabData';
import { MembershipDetailDialogConnector, type ViewingMembership } from './community/MembershipDetailDialogConnector';
import {
  useAddOrganizationDialog,
  useAddVirtualContributorDialog,
  useAddVirtualContributorExternalDialog,
} from './community/useAddCommunityMemberDialog';
import { useCommunityGuidelinesData } from './community/useCommunityGuidelinesData';
import { useCommunityTabData } from './community/useCommunityTabData';
import { useDirtyTabGuardContext } from './DirtyTabGuardContext';
import { useColumnMenu } from './layout/useColumnMenu';
import { useLayoutTabData } from './layout/useLayoutTabData';
import { useApplicationFormData } from './settings/useApplicationFormData';
import { useSettingsTabData } from './settings/useSettingsTabData';
import { useStorageTabData } from './storage/useStorageTabData';
import { useCreateSubspace } from './subspaces/useCreateSubspace';
import { useSubspacesTabData } from './subspaces/useSubspacesTabData';
import { CrdSpaceTemplatesTab } from './templates/CrdSpaceTemplatesTab';
import { useUpdatesTabData } from './updates/useUpdatesTabData';
import { useSettingsScope } from './useSettingsScope';
import { useSpaceSettingsAccessGuard } from './useSpaceSettingsAccessGuard';
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

  // Gate the page on the user's Update privilege for this space. The hook
  // throws NotAuthorizedError (or signals a sign-in redirect) for anyone who
  // shouldn't see settings; otherwise it's a no-op and the page renders.
  useSpaceSettingsAccessGuard(spaceId, scopeLoading);

  const visibleTabs = getVisibleSettingsTabs(level);
  const { activeTab, setActiveTab } = useSpaceSettingsTab(visibleTabs);
  const guard = useDirtyTabGuardContext();

  // Markdown image upload. The ambient `StorageConfigContextProvider`
  // (locationType="space") is mounted by `CrdSpacePageLayout` /
  // `CrdSubspacePageLayout`, so editing existing sections uploads to the
  // space's own bucket (temporaryLocation: false). Creating a subspace has no
  // bucket yet, so it uploads against the parent space's bucket flagged
  // temporary (server GCs it if the create is abandoned) — mirrors MUI.
  const md = useMarkdownEditorIntegration();
  const mdCreate = useMarkdownEditorIntegration({ temporaryLocation: true });

  const isTabVisible = (id: (typeof visibleTabs)[number]) => visibleTabs.includes(id);

  // Each tab's data hook is gated on `activeTab` so only the visible tab's
  // queries fire — mirroring MUI's per-route architecture without splitting
  // this page into separate routes. Apollo's cache lets re-visited tabs return
  // instantly. Local buffers (about edits, layout buffer, updates draft) live
  // in `useState` inside each hook and survive the gating, so the dirty-tab
  // guard still sees `isDirty=true` at the moment of a tab switch.
  const navigate = useNavigate();
  const about = useAboutTabData(activeTab === 'about' ? spaceId : '', spaceUrl, level);
  const layout = useLayoutTabData(activeTab === 'layout' ? spaceId : '');
  const community = useCommunityTabData(activeTab === 'community' ? roleSetId : '');
  const subspacesTab = useSubspacesTabData(activeTab === 'subspaces' ? spaceId : '');
  const createSubspace = useCreateSubspace(spaceId, {
    accountId,
    templatesSetId: subspacesTab.templatesSetId,
    defaultTemplateId: subspacesTab.defaultTemplateId,
  });
  // Subspace "Save as template" now runs through the unified `saveAs` instance below — see T053.
  const storageTab = useStorageTabData(activeTab === 'storage' ? spaceId : '');
  const settingsTab = useSettingsTabData(activeTab === 'settings' ? spaceId : '');
  // ApplicationFormEditor renders inside the Community panel — pull `roleSetId`
  // from the always-available scope instead of `settingsTab` so we don't have
  // to fetch the Settings tab just to know the role set id.
  const applicationForm = useApplicationFormData(activeTab === 'community' ? roleSetId : '');
  const accountTab = useAccountTabData(activeTab === 'account' ? spaceId : '');
  const updatesTab = useUpdatesTabData(activeTab === 'updates' ? communityId || undefined : undefined);
  const communityGuidelinesId = scope.guidelinesId;
  const communityGuidelines = useCommunityGuidelinesData(activeTab === 'community' ? communityGuidelinesId : undefined);

  // Community-guidelines templating (FR-038 / T070): the templates set lives at L0; `useSpaceTemplatesManagerQuery`
  // resolves it via the space lookup (dedupes with the Subspaces-tab query in cache). Only needed on tabs whose
  // pickers / save-as flows consume `templatesSetId`.
  const needsTemplatesSet = activeTab === 'community' || activeTab === 'layout' || activeTab === 'subspaces';
  const { data: templatesManagerData } = useSpaceTemplatesManagerQuery({
    variables: { spaceId },
    skip: !spaceId || !needsTemplatesSet,
  });
  const templatesSetId = templatesManagerData?.lookup.space?.templatesManager?.templatesSet?.id;
  const guidelinesTemplatePicker = useTemplatePicker({
    allowedTypes: ['communityGuidelines'],
    accountId,
    spaceTemplatesSetId: templatesSetId,
  });
  // Unified "Save as a template" dialog driver — used by both the Community-guidelines editor (US5/T070,
  // FR-038) and the Subspaces tab kebab (US4/T053). One dialog instance is enough because only one of
  // the two flows can be open at a time; `openSaveAs` discriminates on the `kind` field.
  const saveAs = useSaveAsTemplate({
    templatesSetId,
    spaceId,
    onSaved: () => subspacesTab.closeSaveAsTemplate(),
    // Save-as always opens the create flow → temporary bucket.
    markdownUpload: { create: mdCreate, edit: md },
    // CG save-as opens the CG template form (title + body + references) — reuse the space-bucket
    // reference upload the live CG editor already wires (same bucket, temporaryLocation: true).
    referenceUpload: {
      onFileUpload: communityGuidelines.onReferenceFileUpload,
      accept: communityGuidelines.referenceUploadAccept,
    },
  });
  const [confirmReplaceGuidelinesOpen, setConfirmReplaceGuidelinesOpen] = useState(false);
  const selectedGuidelinesTemplateId = guidelinesTemplatePicker.selectedTemplateId;
  useEffect(() => {
    if (!selectedGuidelinesTemplateId) return;
    void communityGuidelines.onApplyTemplate(selectedGuidelinesTemplateId);
    // Consume the selection so re-picking the same template (e.g. after a failed apply, or reopening the
    // picker to retry) fires the effect again instead of short-circuiting on a stale "already applied" id.
    guidelinesTemplatePicker.clearSelection();
  }, [selectedGuidelinesTemplateId, communityGuidelines, guidelinesTemplatePicker]);
  const openGuidelinesTemplatePicker = () => {
    if (communityGuidelines.hasContent) setConfirmReplaceGuidelinesOpen(true);
    else guidelinesTemplatePicker.openPicker();
  };

  // Layout-tab: per-flow-state default Callout template (T058) — the column kebab opens this picker.
  const [defaultCalloutTemplateColumnId, setDefaultCalloutTemplateColumnId] = useState<string | null>(null);
  const defaultCalloutTemplatePicker = useTemplatePicker({
    allowedTypes: ['callout'],
    accountId,
    spaceTemplatesSetId: templatesSetId,
  });
  const openDefaultCalloutTemplatePicker = (columnId: string) => {
    setDefaultCalloutTemplateColumnId(columnId);
    defaultCalloutTemplatePicker.openPicker();
  };

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
  const [inviteMembersOpen, setInviteMembersOpen] = useState(false);
  const columnMenu = useColumnMenu({
    innovationFlowId: layout.innovationFlowId,
    onOpenDefaultCalloutTemplatePicker: openDefaultCalloutTemplatePicker,
    callouts: layout.columns.flatMap(col =>
      col.callouts.map(c => ({ id: c.id, flowStateTagsetId: c.flowStateTagsetId, currentStateName: col.title }))
    ),
    columnNames: layout.columns.map(c => ({ id: c.id, title: c.title })),
    onColumnSaved: (columnId, title, description) => {
      layout.markColumnSaved(columnId, title, description);
    },
    onActivePhaseChanged: layout.markCurrentPhaseChanged,
    onDeleteState: level !== 'L0' ? layout.onDeleteState : undefined,
    columnCount: layout.columns.length,
    minimumNumberOfStates: layout.minimumNumberOfStates,
  });
  // When the user picks a Callout template in the layout-tab picker, set it as the chosen flow state's default.
  const selectedDefaultCalloutTemplateId = defaultCalloutTemplatePicker.selectedTemplateId;
  useEffect(() => {
    if (!selectedDefaultCalloutTemplateId || !defaultCalloutTemplateColumnId) return;
    columnMenu.onSetAsDefaultCalloutTemplate(defaultCalloutTemplateColumnId, selectedDefaultCalloutTemplateId);
    setDefaultCalloutTemplateColumnId(null);
    // Consume the selection so re-picking the same template (different column, or same column after a
    // failed apply) fires the effect again instead of short-circuiting on a stale "already applied" key.
    defaultCalloutTemplatePicker.clearSelection();
  }, [selectedDefaultCalloutTemplateId, defaultCalloutTemplateColumnId, columnMenu, defaultCalloutTemplatePicker]);

  // About uses per-section inline Save, but its edits still live in a local
  // buffer that survives a tab switch. Without the guard the admin can wander
  // off and never notice they never hit Save, so About participates too —
  // alongside Layout, the Application Form, and an unpublished Updates draft.
  useEffect(() => {
    if (about.isDirty || layout.isDirty || applicationForm.isDirty || updatesTab.isDirty) {
      guard.markDirty();
    } else {
      guard.clearDirty();
    }
  }, [guard, about.isDirty, layout.isDirty, applicationForm.isDirty, updatesTab.isDirty]);

  const [layoutDiscardOpen, setLayoutDiscardOpen] = useState(false);
  // Save-and-switch is async; disable the dialog while it runs so a double
  // click can't fire duplicate saves, and keep it open if a save rejects.
  const [switchingSave, setSwitchingSave] = useState(false);
  // Drives the "Loading new flow…" overlay on the Layout columns container
  // while the Replace-innovation-flow mutation + InnovationFlowSettings
  // refetch are in flight. Set/cleared by `LayoutReplaceFlowConnector` via
  // its `onImportingChange` callback.
  const [isReplacingFlow, setIsReplacingFlow] = useState(false);

  // Member settings dialog state — owns the active subject so the dialog can be
  // re-mounted instantly when the admin switches between rows. The Remove flow
  // reuses the existing community.pendingRemoval / ConfirmationDialog plumbing
  // below; `removeOriginatedFromDialog` lets us close the Member settings dialog
  // (in addition to the confirmation prompt) when the removal succeeds AND the
  // flow originated from inside the dialog itself (FR-Story-3 AC #3 + AC #2).
  const [activeMemberSubject, setActiveMemberSubject] = useState<MemberSettingsSubject | null>(null);
  const [removeOriginatedFromDialog, setRemoveOriginatedFromDialog] = useState(false);

  // Pending-membership "view" dialog — holds the application/invitation being inspected (read-only).
  const [viewingMembership, setViewingMembership] = useState<ViewingMembership | null>(null);

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

  // Bridge: when Subspaces tab signals "save as template" for a subspace, open the unified
  // `TemplateFormDialog` (`type: 'space'`) pre-filled from that subspace as the source.
  // T053 — the legacy `SaveSubspaceAsTemplateDialog` + `useSaveSubspaceAsTemplate` plumbing is
  // retained on disk (modify-not-delete) but no longer wired into the page.
  useEffect(() => {
    if (!subspacesTab.saveAsTemplateSubspaceId) return;
    const target = subspacesTab.subspaces.find(s => s.id === subspacesTab.saveAsTemplateSubspaceId);
    if (!target) return;
    saveAs.openSaveAs({
      kind: 'subspace',
      subspaceId: target.id,
      name: target.name,
      description: target.description,
    });
    subspacesTab.closeSaveAsTemplate();
  }, [subspacesTab, saveAs]);

  const handleConfirmSwitchSave = async () => {
    if (switchingSave) return;
    setSwitchingSave(true);
    try {
      if (about.isDirty) await about.onSaveAll();
      if (layout.isDirty) await layout.onSave();
      if (applicationForm.isDirty) applicationForm.onSave();
      if (updatesTab.isDirty) await updatesTab.onSubmit();
    } catch {
      // A save failed — keep the dialog open so the user can retry or discard.
      // The pending switch stays unresolved; per-section error status surfaces
      // the failure in the tab itself.
      setSwitchingSave(false);
      return;
    }
    guard.clearDirty();
    const target = guard.pendingSwitch;
    guard.resolvePendingSwitch(true);
    if (target) {
      setActiveTab(target);
    }
    setSwitchingSave(false);
  };
  const handleConfirmSwitchDiscard = () => {
    about.onResetAll();
    layout.onReset();
    applicationForm.onReset();
    updatesTab.onResetDraft();
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
                  onReferencesChange={about.onReferencesChange}
                  onReferenceFileUpload={about.onReferenceFileUpload}
                  referenceUploadAccept={about.referenceUploadAccept}
                  onSaveSection={section => void about.onSaveSection(section)}
                  onImageUpload={md.onImageUpload}
                  iframeAllowedUrls={md.iframeAllowedUrls}
                  onError={md.onError}
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
                onReorderColumns={layout.onReorderColumns}
                onRenameColumn={layout.onRenameColumn}
                onMoveToColumn={layout.onMoveToColumn}
                onViewPost={calloutId => {
                  const target = layout.columns
                    .flatMap(column => column.callouts)
                    .find(callout => callout.id === calloutId);
                  if (target?.profileUrl) navigate(target.profileUrl);
                }}
                onPostDescriptionDisplayChange={layout.onPostDescriptionDisplayChange}
                onSave={layout.onSave}
                onDiscardChanges={() => setLayoutDiscardOpen(true)}
                columnMenuActions={columnMenu}
                onCreatePhase={level !== 'L0' ? layout.onCreateState : undefined}
                maximumNumberOfStates={layout.maximumNumberOfStates}
                isStructureMutating={layout.isStructureMutating}
                isReplacingFlow={isReplacingFlow}
                onImageUpload={md.onImageUpload}
                iframeAllowedUrls={md.iframeAllowedUrls}
                onError={md.onError}
                headerActionsSlot={
                  level !== 'L0' ? (
                    <LayoutReplaceFlowConnector
                      collaborationId={layout.collaborationId}
                      existingCalloutsCount={layout.existingCalloutsCount}
                      disabled={layout.isDirty}
                      onApplyComplete={layout.reseedFromServer}
                      onImportingChange={setIsReplacingFlow}
                    />
                  ) : undefined
                }
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
                      onImageUpload={md.onImageUpload}
                      iframeAllowedUrls={md.iframeAllowedUrls}
                      onError={md.onError}
                    />
                  ) : undefined
                }
                communityGuidelinesSlot={
                  communityGuidelinesId ? (
                    <CommunityGuidelinesEditor
                      value={communityGuidelines.value}
                      loading={communityGuidelines.loading}
                      submitting={communityGuidelines.submitting}
                      canSave={communityGuidelines.canSave}
                      onChange={communityGuidelines.onChange}
                      onSave={() => void communityGuidelines.onSave()}
                      onApplyTemplate={openGuidelinesTemplatePicker}
                      onSaveAsTemplate={() =>
                        saveAs.openSaveAs({
                          kind: 'communityGuidelines',
                          title: communityGuidelines.value.title,
                          bodyMarkdown: communityGuidelines.value.body,
                          references: communityGuidelines.value.references,
                        })
                      }
                      onImageUpload={md.onImageUpload}
                      iframeAllowedUrls={md.iframeAllowedUrls}
                      onError={md.onError}
                      onReferenceFileUpload={communityGuidelines.onReferenceFileUpload}
                      referenceUploadAccept={communityGuidelines.referenceUploadAccept}
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
                onPendingView={id => {
                  const target = community.pendingMemberships.find(m => m.id === id);
                  if (target) setViewingMembership({ id: target.id, type: target.type });
                }}
                onPendingApprove={community.onPendingApprove}
                onPendingReject={community.onPendingReject}
                onPendingDelete={community.onPendingDelete}
                onInviteUsers={() => setInviteMembersOpen(true)}
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
                sortMode={subspacesTab.sortMode}
                onSortModeChange={subspacesTab.onSortModeChange}
                onReorder={subspacesTab.onReorder}
              />
            )}
            {activeTab === 'templates' && isTabVisible('templates') && (
              <CrdSpaceTemplatesTab spaceId={spaceId} accountId={accountId || undefined} />
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
                onImageUpload={md.onImageUpload}
                iframeAllowedUrls={md.iframeAllowedUrls}
                onError={md.onError}
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

      {/* Subspace "Save as template" + Community-Guidelines "Save as template" both flow through the
          unified `saveAs.form` → `<TemplateFormDialog>` mounted below (T053). The legacy
          `SaveSubspaceAsTemplateDialog` + `useSaveSubspaceAsTemplate` remain on disk for reference
          but are no longer wired to this page. */}

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
        onImageUpload={mdCreate.onImageUpload}
        iframeAllowedUrls={mdCreate.iframeAllowedUrls}
        onError={mdCreate.onError}
      />
      <TemplatePicker {...createSubspace.picker} />
      <ConfirmationDialog
        open={createSubspace.overwriteConfirmOpen}
        onOpenChange={open => {
          if (!open) createSubspace.onCancelOverwriteTemplate();
        }}
        title={t('subspaces.createDialog.template.overwriteConfirm.title')}
        description={t('subspaces.createDialog.template.overwriteConfirm.description')}
        confirmLabel={t('subspaces.createDialog.template.overwriteConfirm.confirm')}
        cancelLabel={t('subspaces.createDialog.template.overwriteConfirm.cancel')}
        onConfirm={createSubspace.onConfirmOverwriteTemplate}
        onCancel={createSubspace.onCancelOverwriteTemplate}
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

      <MembershipDetailDialogConnector
        membership={viewingMembership}
        onOpenChange={open => {
          if (!open) setViewingMembership(null);
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
        welcomeMessage={addVCExternalDialog.welcomeMessage}
        onWelcomeMessageChange={addVCExternalDialog.onWelcomeMessageChange}
        welcomeMessageLabel={t('community.virtualContributors.addExternalDialog.welcomeMessageLabel')}
        welcomeMessagePlaceholder={t('community.virtualContributors.addExternalDialog.welcomeMessagePlaceholder')}
      />

      <InviteMembersDialogConnector
        open={inviteMembersOpen}
        onClose={() => setInviteMembersOpen(false)}
        spaceId={spaceId}
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
        loading={switchingSave}
        onSave={handleConfirmSwitchSave}
        onDiscard={handleConfirmSwitchDiscard}
        onCancel={handleConfirmSwitchCancel}
      />

      {/* Community-guidelines + Subspace save-as both drive this shared `<TemplateFormDialog>`
          via the unified `saveAs` instance (FR-038 / T070 / T053). Only one of the two flows can
          be open at a time; the dialog state is reset every time `openSaveAs` is called. */}
      <TemplatePicker {...guidelinesTemplatePicker.pickerProps} />
      <TemplatePicker {...defaultCalloutTemplatePicker.pickerProps} />
      <TemplateFormDialog
        open={saveAs.form.open}
        intent={saveAs.form.intent}
        type={saveAs.form.type}
        commonValue={saveAs.form.commonValue}
        commonErrors={saveAs.form.commonErrors}
        onCommonChange={saveAs.form.onCommonChange}
        perTypeFormSlot={saveAs.form.perTypeFormSlot}
        submitting={saveAs.form.submitting}
        onSubmit={saveAs.form.onSubmit}
        onCancel={saveAs.form.onCancel}
        isDirty={saveAs.form.isDirty}
      />
      <ConfirmationDialog
        open={confirmReplaceGuidelinesOpen}
        onOpenChange={open => {
          if (!open) setConfirmReplaceGuidelinesOpen(false);
        }}
        variant="destructive"
        title={t('community.guidelines.applyConfirm.title')}
        description={t('community.guidelines.applyConfirm.description')}
        confirmLabel={t('community.guidelines.applyConfirm.confirm')}
        cancelLabel={t('community.guidelines.applyConfirm.cancel')}
        onConfirm={() => {
          setConfirmReplaceGuidelinesOpen(false);
          guidelinesTemplatePicker.openPicker();
        }}
        onCancel={() => setConfirmReplaceGuidelinesOpen(false)}
      />
    </div>
  );
}
