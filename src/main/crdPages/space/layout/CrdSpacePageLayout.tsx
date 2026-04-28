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
import { SpaceLevel, VisualType } from '@/core/apollo/generated/graphql-schema';
import { usePageTitle } from '@/core/routing/usePageTitle';
import type { BreadcrumbTrailItem } from '@/crd/components/common/BreadcrumbsTrail';
import { LoadingSpinner } from '@/crd/components/common/LoadingSpinner';
import { MobileSidebarDrawer } from '@/crd/components/common/MobileSidebarDrawer';
import { SpaceHeader } from '@/crd/components/space/SpaceHeader';
import { SpaceNavigationTabs } from '@/crd/components/space/SpaceNavigationTabs';
import { SpaceVisibilityNotice } from '@/crd/components/space/SpaceVisibilityNotice';
import { SpaceSettingsHeader } from '@/crd/components/space/settings/SpaceSettingsHeader';
import {
  type SpaceSettingsTabDescriptor,
  SpaceSettingsTabStrip,
} from '@/crd/components/space/settings/SpaceSettingsTabStrip';
import { useScreenSize } from '@/crd/hooks/useMediaQuery';
import { SpaceShell } from '@/crd/layouts/SpaceShell';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import { useSpace } from '@/domain/space/context/useSpace';
import { useVideoCall } from '@/domain/space/hooks/useVideoCall';
import { getDefaultSpaceVisualUrl } from '@/domain/space/icons/defaultVisualUrls';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import {
  type SpaceSettingsTabId,
  useSpaceSettingsTab,
} from '@/main/crdPages/topLevelPages/spaceSettings/useSpaceSettingsTab';
import { buildSpaceSectionUrl, TabbedLayoutParams } from '@/main/routing/urlBuilders';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { useSetBreadcrumbs } from '@/main/ui/breadcrumbs/BreadcrumbsContext';
import { mapMemberAvatars, mapSpaceVisibility } from '../dataMappers/spacePageDataMapper';
import { CrdSpaceCommunityDialogConnector } from '../dialogs/CrdSpaceCommunityDialogConnector';
import { useCrdSpaceTabs } from '../hooks/useCrdSpaceTabs';

export default function CrdSpacePageLayout() {
  const { t } = useTranslation(['crd-space', 'crd-spaceSettings']);
  const { spaceId, spaceLevel, loading: resolvingUrl } = useUrlResolver();
  const { space, visibility, permissions, loading: loadingSpace } = useSpace();
  const { isVideoCallEnabled, videoCallUrl } = useVideoCall(space.id, space.nameID);
  const { isSmallScreen } = useScreenSize();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [_shareDialogOpen, setShareDialogOpen] = useState(false);
  const [_activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { activeTab: activeSettingsTab, setActiveTab: setActiveSettingsTab } = useSpaceSettingsTab();

  // Sidebar links are portaled in (see SpaceSidebarPortal), so following one
  // doesn't go through any handler in this layout that could close the drawer.
  // Watch pathname instead and auto-close the mobile drawer on every navigation.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isLevelZero = spaceLevel === SpaceLevel.L0;
  usePageTitle(isLevelZero ? space.about.profile.displayName : undefined);

  const { tabs, defaultTabIndex, showSettings } = useCrdSpaceTabs({
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

  if (resolvingUrl || loadingSpace) {
    return <LoadingSpinner />;
  }

  // Parse section index from URL (1-indexed) and clamp to valid tab range
  const sectionParam = searchParams.get(TabbedLayoutParams.Section);
  const maxTabIndex = Math.max(tabs.length - 1, 0);
  let activeTabIndex = 0;
  if (sectionParam) {
    const parsed = parseInt(sectionParam, 10);
    activeTabIndex = Number.isNaN(parsed) ? 0 : Math.max(0, Math.min(parsed - 1, maxTabIndex));
  } else if (defaultTabIndex >= 0) {
    activeTabIndex = Math.min(defaultTabIndex, maxTabIndex);
  }

  const handleTabChange = (index: number) => {
    const url = buildSpaceSectionUrl(space.about.profile.url ?? '', index + 1);
    const newParams = new URLSearchParams(url.split('?')[1] ?? '');
    setSearchParams(newParams, { replace: true });
  };

  const visibilityData = mapSpaceVisibility(visibility);
  const memberAvatars = mapMemberAvatars(space.about.membership?.leadUsers);

  const tabItems = tabs.map(tab => ({ label: tab.label, index: tab.index }));
  const settingsHref = space.about.profile.url ? `${space.about.profile.url}/settings` : undefined;

  const headerActions = {
    showDocuments: true,
    showVideoCall: isVideoCallEnabled && !!videoCallUrl,
    videoCallUrl: videoCallUrl || undefined,
    showShare: true,
    showSettings,
    settingsHref,
    onDocumentsClick: () => setActivityDialogOpen(true),
    onShareClick: () => setShareDialogOpen(true),
    onSettingsClick: () => settingsHref && navigate(settingsHref),
  };

  if (!isLevelZero) {
    // For non-L0 spaces (subspaces), just render the outlet
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Outlet context={{ activeTabIndex, totalTabs: tabs.length }} />
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
    <StorageConfigContextProvider locationType="space" spaceId={spaceId}>
      {visibilityData.status !== 'active' && (
        <SpaceVisibilityNotice status={visibilityData.status} contactHref={visibilityData.contactHref} />
      )}
      <SpaceShell
        header={
          isOnSettings ? (
            <SpaceSettingsHeader
              title={space.about.profile.displayName}
              tagline={space.about.profile.tagline ?? null}
              avatarUrl={space.about.profile.avatar?.uri ?? null}
              initials={(space.about.profile.displayName ?? '').slice(0, 2).toUpperCase()}
              avatarColor={pickColorFromId(spaceId ?? space.about.profile.displayName)}
              tabs={
                <SpaceSettingsTabStrip
                  activeTab={activeSettingsTab}
                  onTabChange={setActiveSettingsTab}
                  tabs={settingsTabs}
                />
              }
            />
          ) : (
            <SpaceHeader
              title={space.about.profile.displayName}
              tagline={space.about.profile.tagline ?? undefined}
              bannerUrl={space.about.profile.banner?.uri ?? getDefaultSpaceVisualUrl(VisualType.Banner, spaceId)}
              memberAvatars={memberAvatars}
              onMemberClick={() => setCommunityOpen(true)}
              actions={headerActions}
            />
          )
        }
        sidebar={isOnSettings ? undefined : sidebarSlot}
        tabs={
          isOnSettings ? undefined : (
            <SpaceNavigationTabs
              tabs={tabItems}
              activeIndex={activeTabIndex}
              onTabChange={handleTabChange}
              isSmallScreen={isSmallScreen}
              onMenuClick={() => setMobileMenuOpen(true)}
            />
          )
        }
      >
        <Suspense fallback={<LoadingSpinner />}>
          <Outlet context={{ activeTabIndex, totalTabs: tabs.length }} />
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

      {/* L0 settings breadcrumbs — only mounted at L0 while on settings, so
          this parent layout doesn't clobber the subspace layout's trail at
          L1 / L2 (`pathname` includes `/settings` at those levels too). */}
      {isLevelZero && isOnSettings && spaceDisplayName && (
        <L0SettingsBreadcrumbs
          spaceDisplayName={spaceDisplayName}
          spaceUrl={spaceUrl}
          activeSettingsTab={activeSettingsTab}
        />
      )}

      {/* Community dialog — opened from banner avatar stack (shared with L1) */}
      <CrdSpaceCommunityDialogConnector
        open={communityOpen}
        onOpenChange={setCommunityOpen}
        roleSetId={space.about.membership?.roleSetID || undefined}
      />
    </StorageConfigContextProvider>
  );
}

function L0SettingsBreadcrumbs({
  spaceDisplayName,
  spaceUrl,
  activeSettingsTab,
}: {
  spaceDisplayName: string;
  spaceUrl: string;
  activeSettingsTab: SpaceSettingsTabId;
}) {
  const { t } = useTranslation('crd-spaceSettings');
  const items: BreadcrumbTrailItem[] = [
    { label: spaceDisplayName, href: spaceUrl, icon: Layers },
    { label: t('tabs.settings'), href: `${spaceUrl}/settings` },
    { label: t(`tabs.${activeSettingsTab}`) },
  ];
  useSetBreadcrumbs(items);
  return null;
}
