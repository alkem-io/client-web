import PlatformNavigationBar from '@/main/ui/platformNavigation/PlatformNavigationBar';
import { Outlet, useLocation } from 'react-router-dom';
import SpaceBreadcrumbs from '../components/spaceBreadcrumbs/SpaceBreadcrumbs';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import SpacePageBanner from './tabbedLayout/layout/SpacePageBanner';
import PlatformFooter from '@/main/ui/platformFooter/PlatformFooter';
import { Paper, Box } from '@mui/material';
import PoweredBy from '@/main/ui/poweredBy/PoweredBy';
import SearchDialog from '@/main/search/SearchDialog';
import FloatingActionButtons from '@/core/ui/button/FloatingActionButtons';
import { gutters } from '@/core/ui/grid/utils';
import { useState } from 'react';
import PlatformHelpButton from '@/main/ui/helpButton/PlatformHelpButton';
import SpaceTabs from './tabbedLayout/Tabs/SpaceTabs';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import SubspacePageBanner from '../components/SubspacePageBanner/SubspacePageBanner';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { useScreenSize } from '@/core/ui/grid/constants';

// keep the logic around sections in one place - SpaceRoutes
export const SpacePageLayout = ({ sectionIndex }: { sectionIndex: number }) => {
  const [isTabsMenuOpen, setTabsMenuOpen] = useState(false);
  const { pathname } = useLocation();

  const isSettingsPage = pathname.split('/').includes('settings');

  const { spaceId, journeyPath, spaceLevel } = useUrlResolver();

  const { isSmallScreen } = useScreenSize();

  const isLevelZero = spaceLevel === SpaceLevel.L0;

  return (
    <StorageConfigContextProvider locationType="journey" spaceId={spaceId}>
      <PlatformNavigationBar breadcrumbs={<SpaceBreadcrumbs journeyPath={journeyPath} settings={isSettingsPage} />} />

      {isLevelZero && <SpacePageBanner loading={false} />}
      {!isLevelZero && <SubspacePageBanner />}

      {!isSmallScreen && isLevelZero && (
        <SpaceTabs
          currentTab={isSettingsPage ? { section: EntityPageSection.Settings } : { sectionIndex }}
          mobile={isSmallScreen}
          onMenuOpen={setTabsMenuOpen}
        />
      )}

      <Outlet />

      <PlatformFooter />
      <FloatingActionButtons
        {...(isSmallScreen ? { bottom: gutters(3) } : {})}
        visible={!isTabsMenuOpen}
        floatingActions={<PlatformHelpButton />}
      />

      {isSmallScreen && (
        <Box component={Paper} square position="fixed" bottom={0} left={0} right={0}>
          <PoweredBy compact />
        </Box>
      )}
      <SearchDialog />
    </StorageConfigContextProvider>
  );
};
