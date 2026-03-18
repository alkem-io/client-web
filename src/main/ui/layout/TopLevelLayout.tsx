import { Box, Paper } from '@mui/material';
import { type PropsWithChildren, type ReactNode, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import usePrefetchRoutes from '@/core/routing/usePrefetchRoutes';
import FloatingActionButtons from '@/core/ui/button/FloatingActionButtons';
import PlatformHelpButton from '../helpButton/PlatformHelpButton';
import Footer from '../platformFooter/PlatformFooter';
import PlatformNavigationBar, { type PlatformNavigationBarProps } from '../platformNavigation/PlatformNavigationBar';
import PoweredBy from '../poweredBy/PoweredBy';

const SearchDialog = lazyWithGlobalErrorHandler(() => import('@/main/search/SearchDialog'));

interface TopLevelDesktopLayoutProps {
  breadcrumbs?: PlatformNavigationBarProps['breadcrumbs'];
  header?: ReactNode;
  floatingActions?: ReactNode; // Defaults to the HelpButton
  addWatermark?: boolean;
}

const TopLevelLayout = ({
  breadcrumbs,
  header,
  floatingActions,
  addWatermark,
  children,
}: PropsWithChildren<TopLevelDesktopLayoutProps>) => {
  usePrefetchRoutes();

  return (
    <>
      <PlatformNavigationBar breadcrumbs={breadcrumbs} />
      {header}
      {children}

      <Outlet />

      <Footer />
      {floatingActions ?? <FloatingActionButtons floatingActions={<PlatformHelpButton />} />}
      {addWatermark && (
        <Box component={Paper} square={true} position="fixed" bottom={0} left={0} right={0}>
          <PoweredBy compact={true} />
        </Box>
      )}
      <Suspense fallback={null}>
        <SearchDialog />
      </Suspense>
    </>
  );
};

export default TopLevelLayout;
