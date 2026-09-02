import {
  Bookmark,
  HardDrive,
  Info,
  Layers,
  LayoutGrid,
  Megaphone,
  Settings as SettingsIcon,
  UserCircle,
  Users,
} from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { usePageTitle } from '@/core/routing/usePageTitle';
import type { BreadcrumbTrailItem } from '@/crd/components/common/BreadcrumbsTrail';
import { LoadingSpinner } from '@/crd/components/common/LoadingSpinner';
import { MobileSidebarDrawer } from '@/crd/components/common/MobileSidebarDrawer';
import { ShareDialog } from '@/crd/components/common/ShareDialog';
import { HeaderActionIcons } from '@/crd/components/space/HeaderActionIcons';
import { SpaceHeader } from '@/crd/components/space/SpaceHeader';
import { SpaceNavigationTabs } from '@/crd/components/space/SpaceNavigationTabs';
import { SpaceVisibilityNotice } from '@/crd/components/space/SpaceVisibilityNotice';
import { SpaceSettingsHeader } from '@/crd/components/space/settings/SpaceSettingsHeader';
import {
  type SpaceSettingsTabDescriptor,
  SpaceSettingsTabStrip,
} from '@/crd/components/space/settings/SpaceSettingsTabStrip';
import { useEdgeSwipe } from '@/crd/hooks/useEdgeSwipe';
import { useMediaQuery, useScreenSize } from '@/crd/hooks/useMediaQuery';
import { SpaceShell } from '@/crd/layouts/SpaceShell';
import { resolveBannerAspectRatio } from '@/crd/lib/bannerAspectRatio';
import { getInitials } from '@/crd/lib/getInitials';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import { useSpace } from '@/domain/space/context/useSpace';
import { useVideoCall } from '@/domain/space/hooks/useVideoCall';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { DirtyTabGuardContext } from '@/main/crdPages/topLevelPages/spaceSettings/DirtyTabGuardContext';
import { useDirtyTabGuard } from '@/main/crdPages/topLevelPages/spaceSettings/useDirtyTabGuard';
import {
  type SpaceSettingsTabId,
  useSpaceSettingsTab,
} from '@/main/crdPages/topLevelPages/spaceSettings/useSpaceSettingsTab';
import { buildSettingsUrl, buildSpaceSectionUrl, TabbedLayoutParams } from '@/main/routing/urlBuilders';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { useSetBreadcrumbs } from '@/main/ui/breadcrumbs/BreadcrumbsContext';
import { useEnableBannerOverlay } from '@/main/ui/layout/BannerOverlayContext';
import { useEnableSpaceFullWidth } from '@/main/ui/layout/LayoutWidthContext';
import { useDownNoticeBanner } from '@/main/ui/layout/useDownNoticeBanner';
import { useLayoutWidthPreference } from '@/main/ui/layout/useLayoutWidthPreference';
import { CalloutShareOnAlkemioForm } from '../callout/CalloutShareOnAlkemioForm';
import { mapSpaceVisibility } from '../dataMappers/spacePageDataMapper';
import { CrdSpaceAboutDialogConnector } from '../dialogs/CrdSpaceAboutDialogConnector';
import { CrdSpaceActivityDialogConnector } from '../dialogs/CrdSpaceActivityDialogConnector';
import { useCrdSpaceTabs } from '../hooks/useCrdSpaceTabs';
import { resolveSidebarPlan } from './sidebarWidgetPlan';

export default function CrdSpacePageLayout() {
  const { t } = useTranslation(['crd-space', 'crd-spaceSettings']);
  const { spaceId, spaceLevel, loading: resolvingUrl } = useUrlResolver();
  const { space, visibility, permissions, loading: loadingSpace } = useSpace();
  const { isVideoCallEnabled, videoCallUrl } = useVideoCall(space.id, space.nameID);
  const { isSmallScreen } = useScreenSize();
  const { wide: fullWidth, toggle: toggleFullWidth } = useLayoutWidthPreference();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { activeTab: activeSettingsTab, setActiveTab: setActiveSettingsTab } = useSpaceSettingsTab();
  // One guard instance, shared with the Settings page (rendered via <Outlet>)
  // through DirtyTabGuardContext. The tab strip lives here in the layout, so
  // the click must consult the guard before navigating — otherwise the
  // discard-changes dialog (owned by the page) never opens.
  const settingsDirtyGuard = useDirtyTabGuard();
  // Read here (before any early return) so the hook order stays stable. The
  // site-wide maintenance notice sits directly under the header; suppress the hero
  // overlay while it shows so the hero doesn't slide up over the notice.
  const { visible: downNoticeVisible } = useDownNoticeBanner();
  const handleSettingsTabChange = async (next: SpaceSettingsTabId) => {
    if (await settingsDirtyGuard.requestSwitch(next)) {
      setActiveSettingsTab(next);
    }
  };

  // Sidebar links are portaled in (see SpaceSidebarPortal), so following one
  // doesn't go through any handler in this layout that could close the drawer.
  // Watch pathname instead and auto-close the mobile drawer on every navigation.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isLevelZero = spaceLevel === SpaceLevel.L0;
  usePageTitle(isLevelZero ? space.about.profile.displayName : undefined);

  const { tabs, defaultTabIndex, sectionCount, showSettings, stateSidebars } = useCrdSpaceTabs({
    spaceId,
    skip: !isLevelZero || !permissions.canRead,
  });

  // L1/L2 settings breadcrumbs are owned by `CrdSubspacePageLayout`. This
  // parent layout only sets breadcrumbs at L0 — and only when on settings —
  // by mounting `<L0SettingsBreadcrumbs>` inside the JSX. If we instead called
  // `useSetBreadcrumbs([])` unconditionally here, it would overwrite the
  // subspace layout's trail on every re-render (e.g., tab switch), making
  // the trail vanish.
  const isOnSettings = pathname.includes('/settings');
  const spaceDisplayName = space.about.profile.displayName;
  const spaceUrl = space.about.profile.url ?? '';

  // Edge-swipe from the left opens the mobile sidebar drawer — same drawer the
  // hamburger triggers. Only armed while the drawer exists: below lg (the
  // desktop sidebar takes over at lg+) and off settings (no drawer there).
  const belowLg = useMediaQuery('(max-width: 1023px)');
  useEdgeSwipe(() => setMobileMenuOpen(true), { enabled: belowLg && isLevelZero && !isOnSettings });

  if (resolvingUrl || loadingSpace) {
    return <LoadingSpinner />;
  }

  // Parse section index from URL (1-indexed) and clamp to valid tab range. Bound by the full
  // section count (hidden tabs keep their original index, so `tabs.length` would under-count and
  // clamp away valid high indices — e.g. Knowledge base when an earlier tab is hidden).
  const sectionParam = searchParams.get(TabbedLayoutParams.Section);
  const maxTabIndex = Math.max(sectionCount - 1, 0);
  let activeTabIndex = 0;
  if (sectionParam) {
    const parsed = parseInt(sectionParam, 10);
    activeTabIndex = Number.isNaN(parsed) ? 0 : Math.max(0, Math.min(parsed - 1, maxTabIndex));
  } else if (defaultTabIndex >= 0) {
    activeTabIndex = Math.min(defaultTabIndex, maxTabIndex);
  }

  // A tab configured with zero renderable widgets gets no sidebar column at all — the
  // content takes the full no-sidebar width (FR-016). Only collapse when the stored list
  // is KNOWN and resolves empty: while SpaceTabs is loading `stateSidebars` is empty, and
  // collapsing then would flash the content full-width on every cold load. The mobile
  // drawer and its triggers (hamburger, bottom bar, edge swipe) stay available regardless.
  const activeTabSidebar = stateSidebars[activeTabIndex];
  const sidebarEmpty = activeTabSidebar !== undefined && resolveSidebarPlan(activeTabSidebar).length === 0;

  const handleTabChange = (index: number) => {
    const url = buildSpaceSectionUrl(space.about.profile.url ?? '', index + 1);
    const newParams = new URLSearchParams(url.split('?')[1] ?? '');
    setSearchParams(newParams, { replace: true });
  };

  const visibilityData = mapSpaceVisibility(visibility);

  // The transparent header + banner-under-header treatment only applies on
  // the active-space home tab(s). Suspended/archived spaces show a visibility
  // notice above the banner — pulling the banner up under the header would
  // collide with it. Settings pages render `SpaceSettingsHeader` (no banner
  // image), so they stay opaque too. `downNoticeVisible` additionally suppresses
  // the overlay while the site-wide incident banner shows (read above).
  const enableBannerOverlay = visibilityData.status === 'active' && !isOnSettings && !downNoticeVisible;

  const tabItems = tabs.map(tab => ({ label: tab.label, index: tab.index }));
  const settingsHref = space.about.profile.url ? buildSettingsUrl(space.about.profile.url) : undefined;

  const headerActions = {
    showInfo: true,
    onInfoClick: () => setAboutDialogOpen(true),
    showActivity: true,
    showVideoCall: isVideoCallEnabled && !!videoCallUrl,
    videoCallUrl: videoCallUrl || undefined,
    showShare: true,
    showSettings,
    settingsHref,
    showFullWidthToggle: true,
    fullWidth,
    onActivityClick: () => setActivityDialogOpen(true),
    onShareClick: () => setShareDialogOpen(true),
    onSettingsClick: () => settingsHref && navigate(settingsHref),
    onToggleFullWidth: toggleFullWidth,
    // Tablet (640–1023px) hamburger: the desktop sidebar is hidden below lg and
    // the phone bottom bar (which has its own trigger) only renders below sm,
    // so this is the only *visible* trigger for the sidebar drawer at those
    // widths (the left-edge swipe gesture also opens it on touch devices).
    onMenuClick: () => setMobileMenuOpen(true),
  };

  // Single opener for the shared About dialog (header info icon + the sidebar
  // "About this Space" widget) — the layout owns the ONE
  // CrdSpaceAboutDialogConnector mount; the tab page reaches it via Outlet context.
  const onOpenAbout = () => setAboutDialogOpen(true);

  if (!isLevelZero) {
    // For non-L0 spaces (subspaces), just render the outlet
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Outlet context={{ activeTabIndex, totalTabs: sectionCount, onOpenAbout }} />
      </Suspense>
    );
  }

  const sidebarSlot = <div id="crd-space-sidebar-desktop" />;

  const settingsTabs: ReadonlyArray<SpaceSettingsTabDescriptor<SpaceSettingsTabId>> = [
    { id: 'about', label: t('crd-spaceSettings:tabs.about', { defaultValue: 'About' }), icon: Info },
    { id: 'layout', label: t('crd-spaceSettings:tabs.layout', { defaultValue: 'Layout' }), icon: LayoutGrid },
    { id: 'community', label: t('crd-spaceSettings:tabs.community', { defaultValue: 'Community' }), icon: Users },
    { id: 'updates', label: t('crd-spaceSettings:tabs.updates', { defaultValue: 'Updates' }), icon: Megaphone },
    { id: 'subspaces', label: t('crd-spaceSettings:tabs.subspaces', { defaultValue: 'Subspaces' }), icon: Layers },
    { id: 'templates', label: t('crd-spaceSettings:tabs.templates', { defaultValue: 'Templates' }), icon: Bookmark },
    { id: 'storage', label: t('crd-spaceSettings:tabs.storage', { defaultValue: 'Storage' }), icon: HardDrive },
    { id: 'settings', label: t('crd-spaceSettings:tabs.settings', { defaultValue: 'Settings' }), icon: SettingsIcon },
    { id: 'account', label: t('crd-spaceSettings:tabs.account', { defaultValue: 'Account' }), icon: UserCircle },
  ];

  return (
    <DirtyTabGuardContext.Provider value={settingsDirtyGuard}>
      <StorageConfigContextProvider locationType="space" spaceId={spaceId}>
        {visibilityData.status !== 'active' && (
          <SpaceVisibilityNotice status={visibilityData.status} contactHref={visibilityData.contactHref} />
        )}
        {enableBannerOverlay && <EnableBannerOverlay />}
        <EnableSpaceFullWidth />
        <SpaceShell
          fullWidth={fullWidth}
          header={
            isOnSettings ? (
              <SpaceSettingsHeader
                title={space.about.profile.displayName}
                titleHref={space.about.profile.url ?? undefined}
                tagline={space.about.profile.tagline ?? null}
                fullWidth={fullWidth}
              />
            ) : (
              <SpaceHeader
                title={space.about.profile.displayName}
                tagline={space.about.profile.tagline ?? undefined}
                bannerUrl={space.about.profile.banner?.uri}
                bannerAlt={space.about.profile.banner?.alternativeText ?? undefined}
                bannerAspectRatio={resolveBannerAspectRatio(space.about.profile.banner)}
                color={pickColorFromId(spaceId ?? space.about.profile.displayName)}
                actions={headerActions}
                overlayHeader={enableBannerOverlay}
                fullWidth={fullWidth}
              />
            )
          }
          sidebar={isOnSettings ? undefined : sidebarSlot}
          // Empty-configured sidebar: the slot stays mounted (the portal resolves its
          // target once on mount) but the column collapses and content goes full width.
          sidebarCollapsed={sidebarEmpty}
          tabs={
            isOnSettings ? (
              // Settings tabs live in the shell's sticky tabs row too, so they
              // stay pinned under the platform header on scroll.
              <SpaceSettingsTabStrip
                activeTab={activeSettingsTab}
                onTabChange={handleSettingsTabChange}
                tabs={settingsTabs}
              />
            ) : (
              <SpaceNavigationTabs
                tabs={tabItems}
                activeIndex={activeTabIndex}
                onTabChange={handleTabChange}
                isSmallScreen={isSmallScreen}
                onMenuClick={() => setMobileMenuOpen(true)}
                // The gray header icons ride the sticky tab row at sm+ so they
                // stay visible on scroll; below sm they render in the header.
                action={<HeaderActionIcons actions={headerActions} />}
              />
            )
          }
        >
          <Suspense fallback={<LoadingSpinner />}>
            <Outlet context={{ activeTabIndex, totalTabs: sectionCount, onOpenAbout }} />
          </Suspense>
        </SpaceShell>

        {!isOnSettings && (
          <MobileSidebarDrawer
            open={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            title={t('crd-space:mobile.menu')}
            closeLabel={t('crd-space:a11y.close')}
          >
            <div id="crd-space-sidebar-mobile" />
          </MobileSidebarDrawer>
        )}

        {/* L0 breadcrumbs — only mounted at L0 so this parent layout doesn't
          clobber the subspace layout's trail at L1 / L2 (CrdSpacePageLayout
          runs hooks at every level; gating the mount on `isLevelZero` keeps
          the publish scoped to L0). On a plain L0 home this emits a single
          current-page crumb; on `/settings` it emits the 3-hop trail. */}
        {isLevelZero && spaceDisplayName && (
          <L0Breadcrumbs
            spaceDisplayName={spaceDisplayName}
            spaceUrl={spaceUrl}
            spaceCardBannerUrl={space.about.profile.cardBanner?.uri || undefined}
            isOnSettings={isOnSettings}
            activeSettingsTab={activeSettingsTab}
          />
        )}

        {/* Activity dialog — opened from header Activity icon. Matches the
          legacy MUI ActivityDialog: queries activity-on-collaboration with
          includeChild so child callout events are included. */}
        <CrdSpaceActivityDialogConnector
          open={activityDialogOpen}
          onOpenChange={setActivityDialogOpen}
          spaceId={spaceId}
        />

        {/* About dialog — the SINGLE mount for the shared CrdSpaceAbout at L0.
          Opened from the header info icon AND (via the `onOpenAbout` Outlet
          context) from the sidebar "About this Space" widget — the sidebar
          connector no longer mounts its own copy. */}
        <CrdSpaceAboutDialogConnector open={aboutDialogOpen} onOpenChange={setAboutDialogOpen} />

        {/* Share dialog — opened from header share icon and the mobile "More" drawer.
          `entityLabel` is lowercased so the default message reads "...this space
          interesting" mid-sentence (mirrors the callout flow's "post"). */}
        <ShareDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          url={spaceUrl}
          shareOnAlkemioSlot={
            spaceUrl ? (
              <CalloutShareOnAlkemioForm
                key={spaceUrl}
                url={spaceUrl}
                entityLabel={t('common.space', { ns: 'crd-common' }).toLowerCase()}
                onClose={() => setShareDialogOpen(false)}
              />
            ) : undefined
          }
        />
      </StorageConfigContextProvider>
    </DirtyTabGuardContext.Provider>
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

function L0Breadcrumbs({
  spaceDisplayName,
  spaceUrl,
  spaceCardBannerUrl,
  isOnSettings,
  activeSettingsTab,
}: {
  spaceDisplayName: string;
  spaceUrl: string;
  spaceCardBannerUrl: string | undefined;
  isOnSettings: boolean;
  activeSettingsTab: SpaceSettingsTabId;
}) {
  const { t } = useTranslation('crd-spaceSettings');
  // L0 has no avatar visual — the cardBanner stands in as the identity image.
  const spaceAvatar = { src: spaceCardBannerUrl, initials: getInitials(spaceDisplayName) };
  const items: BreadcrumbTrailItem[] = isOnSettings
    ? [
        { label: spaceDisplayName, href: spaceUrl, avatar: spaceAvatar },
        { label: t('tabs.settings'), href: buildSettingsUrl(spaceUrl) },
        { label: t(`tabs.${activeSettingsTab}`) },
      ]
    : [{ label: spaceDisplayName, avatar: spaceAvatar }];
  useSetBreadcrumbs(items);
  return null;
}
