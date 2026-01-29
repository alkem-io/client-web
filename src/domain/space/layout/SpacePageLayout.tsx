import PlatformNavigationBar from '@/main/ui/platformNavigation/PlatformNavigationBar';
import { Outlet } from 'react-router-dom';
import SpaceBreadcrumbs from '../components/spaceBreadcrumbs/SpaceBreadcrumbs';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import SpacePageBanner from './tabbedLayout/layout/SpacePageBanner';
import PlatformFooter from '@/main/ui/platformFooter/PlatformFooter';
import { Paper, Box } from '@mui/material';
import PoweredBy from '@/main/ui/poweredBy/PoweredBy';
import SearchDialog from '@/main/search/SearchDialog';
import SubspacePageBanner from '../components/SubspacePageBanner/SubspacePageBanner';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { useScreenSize } from '@/core/ui/grid/constants';
import { useState } from 'react';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import SpaceTabs from './tabbedLayout/Tabs/SpaceTabs';
import FloatingActionButtons from '@/core/ui/button/FloatingActionButtons';
import { gutters } from '@/core/ui/grid/utils';
import PlatformHelpButton from '@/main/ui/helpButton/PlatformHelpButton';
import { useSectionIndex } from './useSectionIndex';
import PageBannerWatermark from '@/main/ui/platformNavigation/PageBannerWatermark';
import { SpaceVisibilityNotice } from '@/domain/space/layout/tabbedLayout/layout/SpaceVisibilityNotice';
import { useSpace } from '@/domain/space/context/useSpace';
import { usePageTitle } from '@/core/routing/usePageTitle';

// keep the logic around sections in one place - SpaceRoutes
export const SpacePageLayout = () => {
  const { spaceId, spaceHierarchyPath, spaceLevel } = useUrlResolver();
  const { space } = useSpace();

  // Set browser tab title to space name only for L0 spaces
  // SubspacePageLayout handles titles for L1/L2 subspaces
  const isLevelZero = spaceLevel === SpaceLevel.L0;
  usePageTitle(isLevelZero ? space.about.profile.displayName : undefined);

  const sectionIndex = useSectionIndex({ spaceId, spaceLevel });

  const { isSmallScreen } = useScreenSize();

  const [isTabsMenuOpen, setTabsMenuOpen] = useState(false);

  return (
    <StorageConfigContextProvider locationType="space" spaceId={spaceId}>
      <PlatformNavigationBar breadcrumbs={<SpaceBreadcrumbs spaceHierarchyPath={spaceHierarchyPath} />} />
      <SpaceVisibilityNotice spaceLevel={spaceLevel} />
      <SpacePageBanner watermark={!isSmallScreen && <PageBannerWatermark />} />
      <SubspacePageBanner />
      {!isSmallScreen && isLevelZero && (
        <SpaceTabs
          mobile={isSmallScreen}
          onMenuOpen={setTabsMenuOpen}
          currentTab={{ sectionIndex: parseInt(sectionIndex) }}
        />
      )}
      <Outlet />
      {isSmallScreen && isLevelZero && (
        <SpaceTabs
          mobile={isSmallScreen}
          onMenuOpen={setTabsMenuOpen}
          currentTab={{ sectionIndex: parseInt(sectionIndex) }}
        />
      )}

      <FloatingActionButtons
        {...(isSmallScreen ? { bottom: gutters(3) } : {})}
        visible={!isTabsMenuOpen}
        floatingActions={<PlatformHelpButton />}
      />

      <PlatformFooter />

      {isSmallScreen && (
        <Box component={Paper} square position="fixed" bottom={0} left={0} right={0}>
          <PoweredBy compact />
        </Box>
      )}
      <SearchDialog />
    </StorageConfigContextProvider>
  );
};
