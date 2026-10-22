import { Layout as LayoutIcon, Plus } from 'lucide-react';
import { type ReactNode, Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router-dom';
import { SpaceLevel, TagsetReservedName } from '@/core/apollo/generated/graphql-schema';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import useNavigate from '@/core/routing/useNavigate';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { LoadingSpinner } from '@/crd/components/common/LoadingSpinner';
import { ShareDialog } from '@/crd/components/common/ShareDialog';
import type { FlowStateSearchStatus } from '@/crd/components/search/FlowStateSearchResults';
import { CommunityUpdatesDialog } from '@/crd/components/space/CommunityUpdatesDialog';
import { HeaderActionIcons } from '@/crd/components/space/HeaderActionIcons';
import { SpaceVisibilityNotice } from '@/crd/components/space/SpaceVisibilityNotice';
import { SubspaceHeader } from '@/crd/components/space/SubspaceHeader';
import { type SubspaceQuickActionId, SubspaceSidebar } from '@/crd/components/space/SubspaceSidebar';
import { SpaceSettingsHeader } from '@/crd/components/space/settings/SpaceSettingsHeader';
import { SpaceSettingsTabStrip } from '@/crd/components/space/settings/SpaceSettingsTabStrip';
import type { SearchSectionProps } from '@/crd/components/space/sidebar/SearchSection';
import { UpdatesSection } from '@/crd/components/space/sidebar/UpdatesSection';
import { useEdgeSwipe } from '@/crd/hooks/useEdgeSwipe';
import { useMediaQuery } from '@/crd/hooks/useMediaQuery';
import { contentColumnClass } from '@/crd/lib/contentColumn';
import { getInitials } from '@/crd/lib/getInitials';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { IconButton } from '@/crd/primitives/icon-button';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { DirtyTabGuardContext } from '@/main/crdPages/topLevelPages/spaceSettings/DirtyTabGuardContext';
import { CreateSubspaceDialogs } from '@/main/crdPages/topLevelPages/spaceSettings/subspaces/CreateSubspaceDialogs';
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
import { buildSettingsTabUrl, buildSubspaceSettingsUrl } from '@/main/routing/urlBuilders';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { useSetBreadcrumbs } from '@/main/ui/breadcrumbs/BreadcrumbsContext';
import { useEnableBannerOverlay } from '@/main/ui/layout/BannerOverlayContext';
import { useEnableSpaceFullWidth } from '@/main/ui/layout/LayoutWidthContext';
import { useDownNoticeBanner } from '@/main/ui/layout/useDownNoticeBanner';
import { useLayoutWidthPreference } from '@/main/ui/layout/useLayoutWidthPreference';
import { CalloutFormConnector } from '../../space/callout/CalloutFormConnector';
import { CalloutShareOnAlkemioForm } from '../../space/callout/CalloutShareOnAlkemioForm';
import { CrdSpaceCommunityDialogConnector } from '../../space/dialogs/CrdSpaceCommunityDialogConnector';
import { InviteMembersDialogConnector } from '../../space/dialogs/InviteMembersDialogConnector';
import { SubspacesDialogConnector } from '../../space/dialogs/SubspacesDialogConnector';
import { useCrdCommunityUpdates } from '../../space/hooks/useCrdCommunityUpdates';
import { useCrdSpaceLocale } from '../../space/hooks/useCrdSpaceLocale';
import { useSidebarFlowStateSearch } from '../../space/hooks/useSidebarFlowStateSearch';
import { SpaceApplyButtonConnector } from '../../space/SpaceApplyButtonConnector';
import { useCrdCalendarUrlState } from '../../space/timeline/useCrdCalendarUrlState';
import { CrdSubspaceAbout } from '../about/CrdSubspaceAbout';
import { CrdSubspaceActivityDialogConnector } from '../dialogs/CrdSubspaceActivityDialogConnector';
import { CrdSubspaceEventsDialogConnector } from '../dialogs/CrdSubspaceEventsDialogConnector';
import { CrdSubspaceIndexDialogConnector } from '../dialogs/CrdSubspaceIndexDialogConnector';
import { useCrdSubspace } from '../hooks/useCrdSubspace';
import { useCrdSubspaceFlow } from '../hooks/useCrdSubspaceFlow';
import { useSubspaceSidebarCollapsed } from '../hooks/useSubspaceSidebarCollapsed';
import { subspaceHomeColumns } from './subspaceHomeColumns';

export type SubspaceMobileMenu = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: ReactNode;
  /** False when the drawer would be empty — no sidebar widgets and no edit-flow link — so no trigger is shown. */
  available: boolean;
};

/** The sidebar search of the active phase — state and fetching live in the layout (the
 *  sidebar renders twice: desktop column and mobile drawer); the callouts page renders the
 *  results in place of the feed while `isSearching`. */
export type SubspaceSearchOutlet = {
  isSearching: boolean;
  status: FlowStateSearchStatus;
  appending: boolean;
  hasMore: boolean;
  sentinelRef: (node?: Element | null) => void;
  retry: () => void;
  calloutIds: string[];
};

export type SubspaceOutletContext = {
  data: ReturnType<typeof useCrdSubspace>;
  mobileMenu: SubspaceMobileMenu;
  /** The gray header action icons — the page renders them on the sticky
   *  flow-tabs row (desktop) so they stay visible on scroll. */
  headerActionIcons?: ReactNode;
  search?: SubspaceSearchOutlet;
};

export default function CrdSubspacePageLayout() {
  const data = useCrdSubspace();

  // Set browser tab title to the subspace name for L1/L2 subspaces. The parent
  // CrdSpacePageLayout passes a stable `undefined` at non-L0, so this child wins
  // once the subspace data resolves (mirrors MUI's SubspacePageLayout).
  usePageTitle(data.subspaceName);

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { spaceLevel } = useUrlResolver();
  const { t } = useTranslation(['crd-spaceSettings', 'crd-subspace']);
  const [activeDialog, setActiveDialog] = useState<SubspaceQuickActionId | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [updatesOpen, setUpdatesOpen] = useState(false);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  // Active flow phase (URL-driven, shared with the callouts page) — the Add Post
  // dialog pre-selects it, exactly as the old flow-tabs button did.
  const { activePhaseId } = useCrdSubspaceFlow(data.phases, data.currentPhaseId);
  const activePhase = data.phases.find(phase => phase.id === activePhaseId);
  const { collapsed: sidebarCollapsed, toggle: toggleSidebarCollapsed } = useSubspaceSidebarCollapsed();
  const locale = useCrdSpaceLocale();
  const skips = data.sidebarSkips;
  // Recent Activity needs a signed-in viewer: the activity query is gated on the platform
  // read-users right, so for anonymous viewers the widget would only produce an error.
  const { isAuthenticated } = useAuthenticationContext();
  const communityUpdates = useCrdCommunityUpdates(data.communityId, skips.updates);
  // Calendar deep links (/calendar, /calendar/:eventId) must keep opening the events dialog
  // even when the `events` widget is not configured.
  const { isAnyCalendarRoute } = useCrdCalendarUrlState();

  // Sidebar search over the ACTIVE phase. Indexed callout documents carry the ROOT space id
  // (and the globally unique flow-state id), so the scope is the level-zero space — the
  // subspace's own id would match nothing. The tag chips wait for an active phase.
  const hasSearchWidget = data.sidebarPlan.includes('search');
  const { section: searchSection, ...searchOutlet } = useSidebarFlowStateSearch({
    enabled: hasSearchWidget,
    spaceId: data.levelZeroSpaceId,
    flowStateId: activePhaseId,
    calloutsSetId: activePhase ? data.calloutsSetId : undefined,
    classificationTagsets: activePhase ? [{ name: TagsetReservedName.FlowState, tags: [activePhase.label] }] : [],
  });
  const searchProps: SearchSectionProps | undefined = hasSearchWidget ? searchSection : undefined;
  // Wire the Create-Subspace template picker with this subspace's own templates
  // set + default subspace template (D21 / FR-031), matching the Settings flow.
  // Account stays undefined at L1/L2 — the same as the Settings scope.
  const createSubspace = useCreateSubspace(data.subspaceId ?? '', {
    templatesSetId: data.templatesSetId,
    defaultTemplateId: data.defaultSubspaceTemplateId,
  });
  const { wide: fullWidth, toggle: toggleFullWidth } = useLayoutWidthPreference();

  // Sidebar links are portaled in via `mobileMenuContent`, so following one
  // doesn't go through any handler in this layout. Watch pathname instead and
  // auto-close the mobile drawer on every navigation.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isOnSettings = pathname.includes('/settings');

  // Edge-swipe from the left opens the mobile menu drawer (the Sheet rendered by
  // SubspaceFlowTabs, whose open state lives here). Only armed while a drawer
  // trigger exists: below lg (desktop sidebar takes over) and off settings.
  const belowLg = useMediaQuery('(max-width: 1023px)');
  // An empty sidebar list renders no sidebar at all; the drawer then only exists for
  // admins, to carry the edit-flow link.
  const hasSidebar = data.sidebarPlan.length > 0;
  const hasMobileMenu = hasSidebar || (data.canEditFlow && !!data.subspaceUrl);
  useEdgeSwipe(() => setMobileMenuOpen(true), { enabled: belowLg && !isOnSettings && hasMobileMenu });

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
          ...(includeL0Crumb
            ? [
                {
                  // biome-ignore lint/style/noNonNullAssertion: includeL0Crumb == true requires levelZeroSpaceName to be set
                  label: data.levelZeroSpaceName!,
                  href: data.levelZeroSpaceUrl,
                  // biome-ignore lint/style/noNonNullAssertion: includeL0Crumb == true requires levelZeroSpaceName to be set
                  avatar: { src: data.levelZeroSpaceAvatarUrl, initials: getInitials(data.levelZeroSpaceName!) },
                },
              ]
            : []),
          {
            label: data.parentSpaceName,
            href: data.parentSpaceUrl,
            avatar: { src: data.parentSpaceAvatarUrl, initials: getInitials(data.parentSpaceName) },
          },
          {
            label: data.subspaceName,
            avatar: { src: data.subspaceAvatarUrl, initials: getInitials(data.subspaceName) },
            ...(isOnSettings ? { href: data.subspaceUrl } : {}),
          },
        ]
      : [];
  const settingsTrail = isOnSettings
    ? [
        { label: t('tabs.settings'), href: buildSubspaceSettingsUrl(data.subspaceUrl) },
        { label: t(`tabs.${activeSettingsTab}`) },
      ]
    : [];
  useSetBreadcrumbs(baseTrail.length > 0 ? [...baseTrail, ...settingsTrail] : []);

  // Read before the early return so hook order stays stable; used below to
  // suppress the hero overlay while the site-wide maintenance notice shows.
  const { visible: downNoticeVisible } = useDownNoticeBanner();

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

  const editFlowHref = data.subspaceUrl ? buildSettingsTabUrl(data.subspaceUrl, 'layout') : undefined;

  // Add Post gate, shared by the sidebar slots and the dialog mount: CreateCallout
  // on the calloutsSet (same as the L0 tabs) and a flow with phases to post into.
  const canCreatePost = data.canCreateCallout && data.phases.length > 0;

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

  // Invite follows the same right as the top-level sidebar's Invite widget: update on the space.
  const canInvite = data.canUpdate;

  const sidebarCommonProps = {
    ...data.sidebar,
    widgets: data.sidebarPlan,
    search: searchProps,
    activityEnabled: isAuthenticated,
    onInviteClick:
      !skips.addUser && canInvite
        ? () => {
            setMobileMenuOpen(false);
            setInviteOpen(true);
          }
        : undefined,
    parentSpaces: data.parentSpaceStack,
    // Only offer the edit pencil to users with Update on the subspace — otherwise it just lands
    // on the access-restricted page.
    onEditClick: data.canUpdate
      ? () => {
          setMobileMenuOpen(false);
          navigate(buildSettingsTabUrl(data.subspaceUrl, 'about'));
        }
      : undefined,
    onAboutClick: () => {
      setMobileMenuOpen(false);
      setAboutOpen(true);
    },
    onQuickActionClick: handleQuickAction,
    // Add Post lives in the sidebar (see `canCreatePost` above).
    actionsSlot: canCreatePost ? (
      <Button
        className="w-full gap-2 text-body-emphasis"
        onClick={() => {
          setMobileMenuOpen(false);
          setCreatePostOpen(true);
        }}
      >
        <Plus className="w-4 h-4" aria-hidden="true" />
        {t('crd-subspace:flow.addPost')}
      </Button>
    ) : undefined,
    // Same action, icon-only, for the collapsed rail — same gate.
    collapsedActionsSlot: canCreatePost ? (
      <IconButton
        tooltipLabel={t('crd-subspace:flow.addPost')}
        tooltipSide="right"
        onClick={() => {
          setMobileMenuOpen(false);
          setCreatePostOpen(true);
        }}
      >
        <Plus className="w-4 h-4" aria-hidden="true" />
      </IconButton>
    ) : undefined,
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
    updatesSlot: (
      <UpdatesSection
        latest={communityUpdates.latest}
        total={communityUpdates.total}
        onSeeAll={() => {
          setMobileMenuOpen(false);
          setUpdatesOpen(true);
        }}
        locale={locale}
      />
    ),
  };

  const headerActions = {
    ...data.bannerActions,
    showFullWidthToggle: true,
    fullWidth,
    onActivityClick: () => setActiveDialog('activity'),
    onShareClick: () => setShareDialogOpen(true),
    onToggleFullWidth: toggleFullWidth,
    onMenuClick: hasMobileMenu ? () => setMobileMenuOpen(true) : undefined,
  };
  // At sm+ the gray icons ride the sticky flow-tabs row (rendered by the
  // callouts page via outlet context) so they stay visible on scroll; below sm
  // the header renders its own copy.
  const headerActionIcons = <HeaderActionIcons actions={headerActions} />;

  // Desktop sidebar is collapsible (persisted); the mobile drawer always shows
  // the full sidebar and has no collapse affordance.
  const desktopSidebar = (
    <SubspaceSidebar {...sidebarCommonProps} collapsed={sidebarCollapsed} onToggleCollapse={toggleSidebarCollapsed} />
  );
  const mobileSidebar = <SubspaceSidebar {...sidebarCommonProps} />;

  const mobileMenuContent = (
    <div className="flex flex-col gap-4">
      {hasSidebar && mobileSidebar}
      {data.canEditFlow && editFlowHref && (
        <a
          href={editFlowHref}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-md text-control font-medium text-foreground hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            hasSidebar && 'border-t border-border pt-4'
          )}
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
    available: hasMobileMenu,
  };

  if (isOnSettings) {
    return (
      <DirtyTabGuardContext.Provider value={settingsDirtyGuard}>
        <StorageConfigContextProvider locationType="space" spaceId={data.subspaceId}>
          {data.visibility.status !== 'active' && (
            <SpaceVisibilityNotice status={data.visibility.status} contactHref={data.visibility.contactHref} />
          )}
          <EnableSpaceFullWidth />
          <div className="flex flex-col bg-background min-h-screen">
            <SpaceSettingsHeader
              title={data.banner.title}
              titleHref={data.subspaceUrl || undefined}
              tagline={data.banner.tagline ?? null}
              visual={{ src: data.subspaceAvatarUrl, initials: getInitials(data.subspaceName) }}
              fullWidth={fullWidth}
            />
            {/* Sticky settings tab row — mirrors SpaceShell's tabs slot so the
                strip stays pinned under the h-16 platform header on scroll. */}
            <div className="w-full px-6 md:px-8 sm:sticky sm:top-16 sm:z-30 sm:pt-4 sm:bg-background/95 sm:backdrop-blur-[8px]">
              <div className="grid grid-cols-12 gap-6">
                <div className={cn('col-span-12', contentColumnClass(fullWidth))}>
                  <SpaceSettingsTabStrip
                    activeTab={activeSettingsTab}
                    onTabChange={handleSettingsTabChange}
                    tabs={settingsTabDescriptors}
                  />
                </div>
              </div>
            </div>
            <main className="flex-1 w-full px-6 md:px-8 pb-8 pt-6">
              <div className="grid grid-cols-12 gap-6 items-start">
                <div className={cn('col-span-12 min-w-0', contentColumnClass(fullWidth))}>
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
  // `downNoticeVisible` (read above) suppresses the hero overlay while the
  // site-wide incident banner shows, so the hero doesn't slide up (-mt-16) over
  // the notice under the header.
  const enableBannerOverlay = data.visibility.status === 'active' && !downNoticeVisible;

  // Sidebar + content share one 12-col track. Two orthogonal toggles move the
  // column boundaries: `sidebarCollapsed` (2-col sidebar → 1-col rail) and
  // `fullWidth` (drop the empty edge gutter columns). See `subspaceHomeColumns`.
  const homeGrid = subspaceHomeColumns(fullWidth, sidebarCollapsed, hasSidebar);

  return (
    <StorageConfigContextProvider locationType="space" spaceId={data.subspaceId}>
      {data.visibility.status !== 'active' && (
        <SpaceVisibilityNotice status={data.visibility.status} contactHref={data.visibility.contactHref} />
      )}
      {enableBannerOverlay && <EnableBannerOverlay />}
      <EnableSpaceFullWidth />

      <div className="flex flex-col bg-background min-h-screen">
        <SubspaceHeader
          {...data.banner}
          fullWidth={fullWidth}
          actions={headerActions}
          overlayHeader={enableBannerOverlay}
        />

        <main className="flex-1 w-full px-6 md:px-8 pb-8">
          <div className="grid grid-cols-12 gap-6 items-start">
            {/* Left sidebar — collapsible 1-col rail; `fullWidth` drops the
                empty edge gutter so it starts at col 1 instead of col 2. */}
            {hasSidebar && (
              <div className={cn('hidden lg:block sticky top-24 self-start', homeGrid.sidebar)}>{desktopSidebar}</div>
            )}

            {/* Main content — fills the remaining columns; widens when the
                sidebar is collapsed and/or full-width removes the gutters. */}
            <div className={cn('col-span-12 min-w-0 space-y-6', homeGrid.main)}>
              <SpaceApplyButtonConnector
                spaceId={data.subspaceId}
                spaceProfileUrl={data.subspaceUrl}
                communityName={data.subspaceName}
                parentSpaceId={data.parentSpaceId}
              />

              <Suspense fallback={<LoadingSpinner />}>
                <Outlet context={{ data, mobileMenu, headerActionIcons, search: searchOutlet }} />
              </Suspense>
            </div>
          </div>
        </main>
      </div>

      {/* Quick-action dialogs are mounted only when their widget is configured, so an
          unconfigured widget fetches nothing. Exceptions: the activity dialog is also
          opened from the header icon, and the events dialog serves calendar deep links. */}
      {!skips.community && (
        <CrdSpaceCommunityDialogConnector
          open={activeDialog === 'community'}
          onOpenChange={open => setActiveDialog(open ? 'community' : null)}
          roleSetId={data.roleSetId}
        />
      )}

      {(!skips.events || isAnyCalendarRoute) && (
        <CrdSubspaceEventsDialogConnector
          open={activeDialog === 'events'}
          onOpenChange={open => setActiveDialog(open ? 'events' : null)}
        />
      )}

      <CrdSubspaceActivityDialogConnector
        open={activeDialog === 'activity'}
        onOpenChange={open => setActiveDialog(open ? 'activity' : null)}
        collaborationId={data.collaborationId}
      />

      {!skips.index && (
        <CrdSubspaceIndexDialogConnector
          open={activeDialog === 'index'}
          onOpenChange={open => setActiveDialog(open ? 'index' : null)}
          calloutsSetId={data.calloutsSetId}
          phaseNames={data.phases.map(phase => phase.label)}
        />
      )}

      {!skips.addUser && canInvite && (
        <InviteMembersDialogConnector
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
          spaceId={data.subspaceId}
          onlyFromParentCommunity={data.level === 'L2'}
        />
      )}

      {/* Add Post — opened from the sidebar actions slot; pre-selects the active phase. */}
      {canCreatePost && data.calloutsSetId && (
        <CalloutFormConnector
          open={createPostOpen}
          onOpenChange={setCreatePostOpen}
          calloutsSetId={data.calloutsSetId}
          activeFlowStateName={activePhase?.label}
          defaultTemplateId={activePhase?.defaultCalloutTemplateId}
        />
      )}

      {!skips.subspaceLinks && (
        <SubspacesDialogConnector
          open={activeDialog === 'subspaces'}
          onOpenChange={open => setActiveDialog(open ? 'subspaces' : null)}
          spaceId={data.subspaceId}
          emptyText={t('crd-subspace:subspaces.empty')}
          onCreateSubspace={handleCreateSubspace}
        />
      )}

      <CrdSubspaceAbout open={aboutOpen} onClose={() => setAboutOpen(false)} />

      <CommunityUpdatesDialog
        open={updatesOpen}
        onOpenChange={setUpdatesOpen}
        updates={communityUpdates.updates}
        loading={communityUpdates.loading}
        locale={locale}
      />

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
              entityLabel={t('common.subspace', { ns: 'crd-common' }).toLowerCase()}
              onClose={() => setShareDialogOpen(false)}
            />
          ) : undefined
        }
      />

      {/* Own boundary: the closed dialog's subtree suspends on lazy i18n namespaces / chunks,
          and must not swap the already-rendered page for a spinner (issue #10043). */}
      <Suspense fallback={null}>
        {data.canCreateSubspace && <CreateSubspaceDialogs createSubspace={createSubspace} />}
      </Suspense>
    </StorageConfigContextProvider>
  );
}

function EnableBannerOverlay() {
  useEnableBannerOverlay();
  return null;
}

function EnableSpaceFullWidth() {
  useEnableSpaceFullWidth();
  return null;
}
