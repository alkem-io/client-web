import { Layers, Layout as LayoutIcon } from 'lucide-react';
import { type ReactNode, Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router-dom';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import { LoadingSpinner } from '@/crd/components/common/LoadingSpinner';
import { ShareDialog } from '@/crd/components/common/ShareDialog';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { SpaceVisibilityNotice } from '@/crd/components/space/SpaceVisibilityNotice';
import { SubspaceHeader } from '@/crd/components/space/SubspaceHeader';
import { type SubspaceQuickActionId, SubspaceSidebar } from '@/crd/components/space/SubspaceSidebar';
import { CreateSubspaceDialog } from '@/crd/components/space/settings/CreateSubspaceDialog';
import { SpaceSettingsHeader } from '@/crd/components/space/settings/SpaceSettingsHeader';
import { SpaceSettingsTabStrip } from '@/crd/components/space/settings/SpaceSettingsTabStrip';
import { TemplatePicker } from '@/crd/components/templates/TemplatePicker';
import { cn } from '@/crd/lib/utils';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { DirtyTabGuardContext } from '@/main/crdPages/topLevelPages/spaceSettings/DirtyTabGuardContext';
import { useCreateSubspace } from '@/main/crdPages/topLevelPages/spaceSettings/subspaces/useCreateSubspace';
import { useDirtyTabGuard } from '@/main/crdPages/topLevelPages/spaceSettings/useDirtyTabGuard';
import {
  type SpaceSettingsTabId,
  useSpaceSettingsTab,
} from '@/main/crdPages/topLevelPages/spaceSettings/useSpaceSettingsTab';
import {
  getVisibleSettingsTabs,
  useSettingsTabDescriptors,
} from '@/main/crdPages/topLevelPages/spaceSettings/useVisibleSettingsTabs';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { useSetBreadcrumbs } from '@/main/ui/breadcrumbs/BreadcrumbsContext';
import { useEnableBannerOverlay } from '@/main/ui/layout/BannerOverlayContext';
import { CalloutShareOnAlkemioForm } from '../../space/callout/CalloutShareOnAlkemioForm';
import { CrdSpaceCommunityDialogConnector } from '../../space/dialogs/CrdSpaceCommunityDialogConnector';
import { SpaceApplyButtonConnector } from '../../space/SpaceApplyButtonConnector';
import { CrdSubspaceAboutDialogConnector } from '../dialogs/CrdSubspaceAboutDialogConnector';
import { CrdSubspaceActivityDialogConnector } from '../dialogs/CrdSubspaceActivityDialogConnector';
import { CrdSubspaceEventsDialogConnector } from '../dialogs/CrdSubspaceEventsDialogConnector';
import { CrdSubspaceIndexDialogConnector } from '../dialogs/CrdSubspaceIndexDialogConnector';
import { CrdSubspaceSubspacesDialogConnector } from '../dialogs/CrdSubspaceSubspacesDialogConnector';
import { useCrdSubspace } from '../hooks/useCrdSubspace';
import { useSubspaceSidebarCollapsed } from '../hooks/useSubspaceSidebarCollapsed';

export type SubspaceMobileMenu = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: ReactNode;
};

export type SubspaceOutletContext = {
  data: ReturnType<typeof useCrdSubspace>;
  mobileMenu: SubspaceMobileMenu;
};

export default function CrdSubspacePageLayout() {
  const data = useCrdSubspace();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { spaceLevel } = useUrlResolver();
  const { t } = useTranslation(['crd-spaceSettings', 'crd-subspace']);
  const [activeDialog, setActiveDialog] = useState<SubspaceQuickActionId | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { collapsed: sidebarCollapsed, toggle: toggleSidebarCollapsed } = useSubspaceSidebarCollapsed();
  const createSubspace = useCreateSubspace(data.subspaceId ?? '');

  // Sidebar links are portaled in via `mobileMenuContent`, so following one
  // doesn't go through any handler in this layout. Watch pathname instead and
  // auto-close the mobile drawer on every navigation.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isOnSettings = pathname.includes('/settings');
  const settingsLevel: 'L1' | 'L2' = spaceLevel === SpaceLevel.L2 ? 'L2' : 'L1';
  const visibleSettingsTabs = getVisibleSettingsTabs(settingsLevel);
  const settingsTabDescriptors = useSettingsTabDescriptors(settingsLevel);
  const { activeTab: activeSettingsTab, setActiveTab: setActiveSettingsTab } = useSpaceSettingsTab(visibleSettingsTabs);
  // Shared with the Settings page (rendered via <Outlet>) via
  // DirtyTabGuardContext so a tab click consults the guard before navigating
  // and the discard-changes dialog (owned by the page) can open.
  const settingsDirtyGuard = useDirtyTabGuard();
  const handleSettingsTabChange = async (next: SpaceSettingsTabId) => {
    if (await settingsDirtyGuard.requestSwitch(next)) {
      setActiveSettingsTab(next);
    }
  };

  // Breadcrumbs render the full ancestor chain. At L1 the L0 hop is the same as the
  // parent — collapse to a single hop. At L2 the L0 hop is distinct, so we render
  // L0 → L1 → L2. On `/settings` we additionally append a Settings hop and the
  // active tab label, mirroring the L0 settings breadcrumb shape.
  const includeL0Crumb =
    !!data.levelZeroSpaceName && !!data.levelZeroSpaceId && data.levelZeroSpaceId !== data.parentSpaceId;
  const baseTrail =
    data.parentSpaceName && data.subspaceName
      ? [
          ...(includeL0Crumb ? [{ label: data.levelZeroSpaceName!, href: data.levelZeroSpaceUrl, icon: Layers }] : []),
          { label: data.parentSpaceName, href: data.parentSpaceUrl, icon: Layers },
          {
            label: data.subspaceName,
            ...(isOnSettings ? { href: data.subspaceUrl, icon: Layers } : {}),
          },
        ]
      : [];
  const settingsTrail = isOnSettings
    ? [{ label: t('tabs.settings'), href: `${data.subspaceUrl}/settings` }, { label: t(`tabs.${activeSettingsTab}`) }]
    : [];
  useSetBreadcrumbs(baseTrail.length > 0 ? [...baseTrail, ...settingsTrail] : []);

  if (data.loading) {
    return <LoadingSpinner />;
  }

  if (data.notFound) {
    return null;
  }

  const handleQuickAction = (id: SubspaceQuickActionId) => {
    setMobileMenuOpen(false);
    setActiveDialog(id);
  };

  const editFlowHref = data.subspaceUrl ? `${data.subspaceUrl}/settings/layout` : undefined;

  // Single source of truth for the create-subspace handler. Both the sidebar
  // widget (when there are 0 nested subspaces) and the Subspaces dialog footer
  // call it; `data.canCreateSubspace` is the only privilege gate.
  const handleCreateSubspace = data.canCreateSubspace
    ? () => {
        setMobileMenuOpen(false);
        // Close the Subspaces (or any) quick-action dialog first. Leaving it
        // open would stack two modal Radix dialogs whose focus traps fight each
        // other, leaving the create form unresponsive.
        setActiveDialog(null);
        createSubspace.openDialog();
      }
    : undefined;

  const sidebarCommonProps = {
    ...data.sidebar,
    onEditClick: () => {
      setMobileMenuOpen(false);
      navigate(`${data.subspaceUrl}/settings/about`);
    },
    onAboutClick: () => {
      setMobileMenuOpen(false);
      setAboutOpen(true);
    },
    onQuickActionClick: handleQuickAction,
    subspaces: data.subspaces,
    onShowAllSubspaces: () => {
      setMobileMenuOpen(false);
      setActiveDialog('subspaces');
    },
    onSubspaceClick: (href: string) => {
      setMobileMenuOpen(false);
      navigate(href);
    },
    onCreateSubspace: handleCreateSubspace,
  };

  // Desktop sidebar is collapsible (persisted); the mobile drawer always shows
  // the full sidebar and has no collapse affordance.
  const desktopSidebar = (
    <SubspaceSidebar {...sidebarCommonProps} collapsed={sidebarCollapsed} onToggleCollapse={toggleSidebarCollapsed} />
  );
  const mobileSidebar = <SubspaceSidebar {...sidebarCommonProps} />;

  const mobileMenuContent = (
    <div className="flex flex-col gap-4">
      {mobileSidebar}
      {data.canEditFlow && editFlowHref && (
        <a
          href={editFlowHref}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-control font-medium text-foreground border-t border-border pt-4 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => setMobileMenuOpen(false)}
        >
          <LayoutIcon className="w-4 h-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          {t('crd-subspace:flow.editFlow')}
        </a>
      )}
    </div>
  );

  const mobileMenu: SubspaceMobileMenu = {
    open: mobileMenuOpen,
    onOpenChange: setMobileMenuOpen,
    content: mobileMenuContent,
  };

  if (isOnSettings) {
    return (
      <DirtyTabGuardContext.Provider value={settingsDirtyGuard}>
        <StorageConfigContextProvider locationType="space" spaceId={data.subspaceId}>
          {data.visibility.status !== 'active' && (
            <SpaceVisibilityNotice status={data.visibility.status} contactHref={data.visibility.contactHref} />
          )}
          <div className="flex flex-col bg-background min-h-screen">
            <SpaceSettingsHeader
              title={data.banner.title}
              tagline={data.banner.tagline ?? null}
              avatarUrl={data.banner.subspaceAvatarUrl ?? null}
              initials={data.banner.subspaceInitials}
              avatarColor={data.banner.subspaceColor}
              tabs={
                <SpaceSettingsTabStrip
                  activeTab={activeSettingsTab}
                  onTabChange={handleSettingsTabChange}
                  tabs={settingsTabDescriptors}
                />
              }
            />
            <main className="flex-1 w-full px-6 md:px-8 pb-8">
              <div className="grid grid-cols-12 gap-6 items-start">
                <div className="col-span-12 lg:col-start-2 lg:col-span-10 min-w-0">
                  <Suspense fallback={<LoadingSpinner />}>
                    <Outlet context={{ data }} />
                  </Suspense>
                </div>
              </div>
            </main>
          </div>
        </StorageConfigContextProvider>
      </DirtyTabGuardContext.Provider>
    );
  }

  // Transparent header + banner-under-header treatment is only safe on the
  // active subspace home; suspended/archived shows a visibility notice that
  // would collide with -mt-16, and `isOnSettings` is already a separate
  // branch above with no banner image.
  const enableBannerOverlay = data.visibility.status === 'active';

  return (
    <StorageConfigContextProvider locationType="space" spaceId={data.subspaceId}>
      {data.visibility.status !== 'active' && (
        <SpaceVisibilityNotice status={data.visibility.status} contactHref={data.visibility.contactHref} />
      )}
      {enableBannerOverlay && <EnableBannerOverlay />}

      <div className="flex flex-col bg-background min-h-screen">
        <SubspaceHeader
          {...data.banner}
          actions={{
            ...data.bannerActions,
            onActivityClick: () => setActiveDialog('activity'),
            onShareClick: () => setShareDialogOpen(true),
            onMenuClick: () => setMobileMenuOpen(true),
          }}
          overlayHeader={enableBannerOverlay}
        />

        <main className="flex-1 w-full px-6 md:px-8 pb-8">
          <div className="grid grid-cols-12 gap-6 items-start">
            {/* Left sidebar — cols 2-3 when expanded; a single-col icon rail
                when collapsed, freeing a column for the content area. */}
            <div
              className={cn(
                'hidden lg:block sticky top-24 self-start',
                sidebarCollapsed ? 'lg:col-start-2 lg:col-span-1' : 'lg:col-start-2 col-span-2'
              )}
            >
              {desktopSidebar}
            </div>

            {/* Main content — cols 4-11 when the sidebar is expanded; widens to
                cols 3-11 when collapsed. One col gap from the right edge. */}
            <div
              className={cn(
                'col-span-12 min-w-0 space-y-6',
                sidebarCollapsed ? 'lg:col-start-3 lg:col-span-9' : 'lg:col-start-4 lg:col-span-8'
              )}
            >
              <SpaceApplyButtonConnector
                spaceId={data.subspaceId}
                spaceProfileUrl={data.subspaceUrl}
                communityName={data.subspaceName}
                parentSpaceId={data.parentSpaceId}
              />

              <Suspense fallback={<LoadingSpinner />}>
                <Outlet context={{ data, mobileMenu }} />
              </Suspense>
            </div>
          </div>
        </main>
      </div>

      {/* Community dialog — opened from banner avatar stack OR sidebar Quick Action */}
      <CrdSpaceCommunityDialogConnector
        open={activeDialog === 'community'}
        onOpenChange={open => setActiveDialog(open ? 'community' : null)}
        roleSetId={data.roleSetId}
      />

      <CrdSubspaceEventsDialogConnector
        open={activeDialog === 'events'}
        onOpenChange={open => setActiveDialog(open ? 'events' : null)}
      />

      <CrdSubspaceActivityDialogConnector
        open={activeDialog === 'activity'}
        onOpenChange={open => setActiveDialog(open ? 'activity' : null)}
        collaborationId={data.collaborationId}
      />

      <CrdSubspaceIndexDialogConnector
        open={activeDialog === 'index'}
        onOpenChange={open => setActiveDialog(open ? 'index' : null)}
        calloutsSetId={data.calloutsSetId}
      />

      <CrdSubspaceSubspacesDialogConnector
        open={activeDialog === 'subspaces'}
        onOpenChange={open => setActiveDialog(open ? 'subspaces' : null)}
        subspaceId={data.subspaceId}
        onCreateSubspace={handleCreateSubspace}
      />

      <CrdSubspaceAboutDialogConnector open={aboutOpen} onOpenChange={setAboutOpen} />

      {/* Share dialog — opened from the SubspaceHeader share icon. Mirrors the L0 wiring in
          CrdSpacePageLayout: URL + clipboard copy, plus a "Share on Alkemio" sub-view. */}
      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        url={data.subspaceUrl}
        shareOnAlkemioSlot={
          data.subspaceUrl ? (
            <CalloutShareOnAlkemioForm
              key={data.subspaceUrl}
              url={data.subspaceUrl}
              entityLabel={t('common.subspace', { ns: 'translation' }).toLowerCase()}
            />
          ) : undefined
        }
      />

      {data.canCreateSubspace && (
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
            title={t('crd-spaceSettings:subspaces.createDialog.template.overwriteConfirm.title')}
            description={t('crd-spaceSettings:subspaces.createDialog.template.overwriteConfirm.description')}
            confirmLabel={t('crd-spaceSettings:subspaces.createDialog.template.overwriteConfirm.confirm')}
            cancelLabel={t('crd-spaceSettings:subspaces.createDialog.template.overwriteConfirm.cancel')}
            onConfirm={createSubspace.onConfirmOverwriteTemplate}
            onCancel={createSubspace.onCancelOverwriteTemplate}
          />
        </>
      )}
    </StorageConfigContextProvider>
  );
}

function EnableBannerOverlay() {
  useEnableBannerOverlay();
  return null;
}
