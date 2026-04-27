import {
  Bookmark,
  HardDrive,
  History,
  Info,
  Layers,
  LayoutGrid,
  Megaphone,
  Settings,
  Settings as SettingsIcon,
  Share2,
  UserCircle,
  Users,
} from 'lucide-react';
import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { SpaceLevel, VisualType } from '@/core/apollo/generated/graphql-schema';
import { usePageTitle } from '@/core/routing/usePageTitle';
import type { BreadcrumbTrailItem } from '@/crd/components/common/BreadcrumbsTrail';
import { LoadingSpinner } from '@/crd/components/common/LoadingSpinner';
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
  const { isSmallScreen } = useScreenSize();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [_shareDialogOpen, setShareDialogOpen] = useState(false);
  const [_activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const { activeTab: activeSettingsTab, setActiveTab: setActiveSettingsTab } = useSpaceSettingsTab();

  const isLevelZero = spaceLevel === SpaceLevel.L0;
  usePageTitle(isLevelZero ? space.about.profile.displayName : undefined);

  const { tabs, defaultTabIndex, showSettings } = useCrdSpaceTabs({
    spaceId,
    skip: !isLevelZero || !permissions.canRead,
  });

  // Must be derived before any early returns so `useSetBreadcrumbs` is called
  // on every render. During loading the space fields are empty strings and
  // the trail is `[]`; it updates once Apollo populates the context.
  const isOnSettings = pathname.includes('/settings');
  const spaceDisplayName = space.about.profile.displayName;
  const spaceUrl = space.about.profile.url ?? '';

  const breadcrumbItems: BreadcrumbTrailItem[] =
    isLevelZero && isOnSettings && spaceDisplayName
      ? [
          { label: spaceDisplayName, href: spaceUrl, icon: Layers },
          {
            label: t('crd-spaceSettings:tabs.settings'),
            href: `${spaceUrl}/settings`,
          },
          { label: t(`crd-spaceSettings:tabs.${activeSettingsTab}`) },
        ]
      : [];
  useSetBreadcrumbs(breadcrumbItems);

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
    showVideoCall: false, // Wired to entitlements in future
    showShare: true,
    showSettings,
    settingsHref,
    onDocumentsClick: () => setActivityDialogOpen(true),
    onShareClick: () => setShareDialogOpen(true),
    onSettingsClick: () => settingsHref && navigate(settingsHref),
  };

  // Mobile actions for the "More" drawer
  const mobileActions = [
    { label: t('mobile.activity'), icon: <History className="w-4 h-4" />, onClick: () => setActivityDialogOpen(true) },
    { label: t('mobile.share'), icon: <Share2 className="w-4 h-4" />, onClick: () => setShareDialogOpen(true) },
    ...(showSettings && settingsHref
      ? [{ label: t('mobile.settings'), icon: <Settings className="w-4 h-4" />, onClick: () => navigate(settingsHref) }]
      : []),
  ];

  if (!isLevelZero) {
    // For non-L0 spaces (subspaces), just render the outlet
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Outlet context={{ activeTabIndex, totalTabs: tabs.length }} />
      </Suspense>
    );
  }

  const sidebarSlot = <div id="crd-space-sidebar" />;

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
              memberCount={memberAvatars.length}
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
              mobileActions={mobileActions}
            />
          )
        }
      >
        <Suspense fallback={<LoadingSpinner />}>
          <Outlet context={{ activeTabIndex, totalTabs: tabs.length }} />
        </Suspense>
      </SpaceShell>

      {/* Community dialog — opened from banner avatar stack (shared with L1) */}
      <CrdSpaceCommunityDialogConnector
        open={communityOpen}
        onOpenChange={setCommunityOpen}
        roleSetId={space.about.membership?.roleSetID || undefined}
      />
    </StorageConfigContextProvider>
  );
}
