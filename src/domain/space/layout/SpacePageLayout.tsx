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

// keep the logic around sections in one place - SpaceRoutes
export const SpacePageLayout = () => {
  const { spaceId, spaceHierarchyPath } = useUrlResolver();

  const { isSmallScreen } = useScreenSize();

  return (
    <StorageConfigContextProvider locationType="space" spaceId={spaceId}>
      <PlatformNavigationBar breadcrumbs={<SpaceBreadcrumbs spaceHierarchyPath={spaceHierarchyPath} />} />

      <SpacePageBanner />
      <SubspacePageBanner />

      <Outlet />

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
