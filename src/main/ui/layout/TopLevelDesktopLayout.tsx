import React, { PropsWithChildren, ReactNode } from 'react';
import PlatformNavigationBar, { PlatformNavigationBarProps } from '../platformNavigation/PlatformNavigationBar';
import Footer from '../platformFooter/PlatformFooter';
import FloatingActionButtons from '../../../core/ui/button/FloatingActionButtons';
import PlatformHelpButton from '../helpButton/PlatformHelpButton';
import PoweredBy from '../poweredBy/PoweredBy';
import { Box, Paper } from '@mui/material';

interface TopLevelDesktopLayoutProps {
  breadcrumbs?: PlatformNavigationBarProps['breadcrumbs'];
  header?: ReactNode;
  floatingActions?: ReactNode; // Defaults to the HelpButton
  addWatermark?: boolean;
}

const TopLevelDesktopLayout = ({
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
      <Footer />
      {floatingActions ?? <FloatingActionButtons floatingActions={<PlatformHelpButton />} />}
      {addWatermark && (
        <Box component={Paper} square position="fixed" bottom={0} left={0} right={0}>
          <PoweredBy compact />
        </Box>
      )}
    </>
  );
};

export default TopLevelDesktopLayout;
