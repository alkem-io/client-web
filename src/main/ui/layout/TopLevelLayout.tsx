import React, { PropsWithChildren, ReactNode, Suspense } from 'react';
import PlatformNavigationBar, { PlatformNavigationBarProps } from '../platformNavigation/PlatformNavigationBar';
import Footer from '../platformFooter/PlatformFooter';
import FloatingActionButtons from '@/core/ui/button/FloatingActionButtons';
import PlatformHelpButton from '../helpButton/PlatformHelpButton';
import PoweredBy from '../poweredBy/PoweredBy';
import { Box, Paper } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';

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
  return (
    <>
      <PlatformNavigationBar breadcrumbs={breadcrumbs} />
      {header}
      {children}

      <Outlet />

      <Footer />
      {floatingActions ?? <FloatingActionButtons floatingActions={<PlatformHelpButton />} />}
      {addWatermark && (
        <Box component={Paper} square position="fixed" bottom={0} left={0} right={0}>
          <PoweredBy compact />
        </Box>
      )}
      <Suspense fallback={null}>
        <SearchDialog />
      </Suspense>
    </>
  );
};

export default TopLevelLayout;
