import React, { ComponentType, PropsWithChildren, ReactNode } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import PlatformNavigationBar from '../../../../main/ui/platformNavigation/PlatformNavigationBar';
import Footer from '../../../../main/ui/platformFooter/PlatformFooter';
import FloatingActionButtons from '../../../../core/ui/button/FloatingActionButtons';
import PlatformHelpButton from '../../../../main/ui/helpButton/PlatformHelpButton';

export interface BasePageLayoutProps {
  pageBannerComponent?: ComponentType;
  pageBanner?: ReactNode;
}

const BasePageLayout = ({
  pageBannerComponent: PageBanner,
  pageBanner,
  children,
}: PropsWithChildren<BasePageLayoutProps>) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  return (
    <>
      <PlatformNavigationBar />
      {PageBanner ? <PageBanner /> : pageBanner}
      {children}
      {!isMobile && (
        <>
          <Footer />
          <FloatingActionButtons floatingActions={<PlatformHelpButton />} />
        </>
      )}
    </>
  );
};

export default BasePageLayout;
