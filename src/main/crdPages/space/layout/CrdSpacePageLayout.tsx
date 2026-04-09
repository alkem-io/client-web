import { History, Settings, Share2 } from 'lucide-react';
import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import { SpaceLevel, VisualType } from '@/core/apollo/generated/graphql-schema';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { LoadingSpinner } from '@/crd/components/common/LoadingSpinner';
import { SpaceHeader } from '@/crd/components/space/SpaceHeader';
import { SpaceNavigationTabs } from '@/crd/components/space/SpaceNavigationTabs';
import { SpaceVisibilityNotice } from '@/crd/components/space/SpaceVisibilityNotice';
import { useScreenSize } from '@/crd/hooks/useMediaQuery';
import { SpaceShell } from '@/crd/layouts/SpaceShell';
import { useSpace } from '@/domain/space/context/useSpace';
import { getDefaultSpaceVisualUrl } from '@/domain/space/icons/defaultVisualUrls';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { buildSpaceSectionUrl, TabbedLayoutParams } from '@/main/routing/urlBuilders';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { mapMemberAvatars, mapSpaceVisibility } from '../dataMappers/spacePageDataMapper';
import { useCrdSpaceTabs } from '../hooks/useCrdSpaceTabs';

export default function CrdSpacePageLayout() {
  const { t } = useTranslation('crd-space');
  const { spaceId, spaceLevel, loading: resolvingUrl } = useUrlResolver();
  const { space, visibility, permissions, loading: loadingSpace } = useSpace();
  const { isSmallScreen } = useScreenSize();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [_shareDialogOpen, setShareDialogOpen] = useState(false);
  const [_activityDialogOpen, setActivityDialogOpen] = useState(false);

  const isLevelZero = spaceLevel === SpaceLevel.L0;
  usePageTitle(isLevelZero ? space.about.profile.displayName : undefined);

  const { tabs, defaultTabIndex, showSettings } = useCrdSpaceTabs({
    spaceId,
    skip: !isLevelZero || !permissions.canRead,
  });

  // Permission guard: redirect unauthorized users to the About page
  if (resolvingUrl || loadingSpace) {
    return <LoadingSpinner />;
  }

  if (!permissions.canRead) {
    const aboutPath = space.about.profile.url ? `${space.about.profile.url}/about` : 'about';
    // Avoid infinite redirect when already on the About page
    if (!window.location.pathname.endsWith('/about')) {
      return <Navigate to={aboutPath} replace={true} />;
    }
  }

  // Parse section index from URL
  const sectionParam = searchParams.get(TabbedLayoutParams.Section);
  let activeTabIndex = 0;
  if (sectionParam) {
    const parsed = parseInt(sectionParam, 10);
    activeTabIndex = Number.isNaN(parsed) ? 0 : parsed - 1; // URL is 1-indexed
  } else if (defaultTabIndex >= 0) {
    activeTabIndex = defaultTabIndex;
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
        <Outlet context={{ activeTabIndex }} />
      </Suspense>
    );
  }

  const sidebarSlot = <div id="crd-space-sidebar" />;

  return (
    <StorageConfigContextProvider locationType="space" spaceId={spaceId}>
      {visibilityData.status !== 'active' && (
        <SpaceVisibilityNotice status={visibilityData.status} contactHref={visibilityData.contactHref} />
      )}
      <SpaceShell
        header={
          <SpaceHeader
            title={space.about.profile.displayName}
            tagline={space.about.profile.tagline ?? undefined}
            bannerUrl={space.about.profile.banner?.uri ?? getDefaultSpaceVisualUrl(VisualType.Banner, spaceId)}
            memberAvatars={memberAvatars}
            memberCount={memberAvatars.length}
            actions={headerActions}
          />
        }
        sidebar={sidebarSlot}
        tabs={
          <SpaceNavigationTabs
            tabs={tabItems}
            activeIndex={activeTabIndex}
            onTabChange={handleTabChange}
            isSmallScreen={isSmallScreen}
            mobileActions={mobileActions}
          />
        }
      >
        <Suspense fallback={<LoadingSpinner />}>
          <Outlet context={{ activeTabIndex }} />
        </Suspense>
      </SpaceShell>
    </StorageConfigContextProvider>
  );
}
