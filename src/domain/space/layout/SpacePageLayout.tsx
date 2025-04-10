import PlatformNavigationBar from '@/main/ui/platformNavigation/PlatformNavigationBar';
import { Outlet, useLocation } from 'react-router-dom';
import SpaceBreadcrumbs from '../components/spaceBreadcrumbs/SpaceBreadcrumbs';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import SpacePageBanner from './tabbedLayout/layout/SpacePageBanner';
import PlatformFooter from '@/main/ui/platformFooter/PlatformFooter';
import { useMediaQuery, Paper, Theme, Box } from '@mui/material';
import PoweredBy from '@/main/ui/poweredBy/PoweredBy';
import SearchDialog from '@/main/search/SearchDialog';
import FloatingActionButtons from '@/core/ui/button/FloatingActionButtons';
import { gutters } from '@/core/ui/grid/utils';
import { useState } from 'react';
import PlatformHelpButton from '@/main/ui/helpButton/PlatformHelpButton';
import SpaceTabs from './tabbedLayout/Tabs/SpaceTabs';

export const SpacePageLayout = () => {
  const [isTabsMenuOpen, setTabsMenuOpen] = useState(false);
  const { loading, journeyPath } = useUrlResolver();
  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('lg'));

  const location = useLocation();
  let sectionIndex;
  if (location.pathname.includes('challenges')) {
    sectionIndex = 2;
  } else {
    sectionIndex = parseInt(location.pathname.split('/').at(-1) || '1') - 1;
  }

  return (
    <>
      <PlatformNavigationBar breadcrumbs={<SpaceBreadcrumbs journeyPath={journeyPath} />} />
      <SpacePageBanner loading={loading} />
      {!isMobile && <SpaceTabs currentTab={{ sectionIndex }} mobile={isMobile} onMenuOpen={setTabsMenuOpen} />}
      <Outlet />
      <PlatformFooter />
      <FloatingActionButtons
        {...(isMobile ? { bottom: gutters(3) } : {})}
        visible={!isTabsMenuOpen}
        floatingActions={<PlatformHelpButton />}
      />

      {isMobile && (
        <Box component={Paper} square position="fixed" bottom={0} left={0} right={0}>
          <PoweredBy compact />
        </Box>
      )}
      <SearchDialog />
    </>
  );
};
