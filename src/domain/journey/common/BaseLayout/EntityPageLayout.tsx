import React, { ComponentType, PropsWithChildren, ReactNode } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import TopBar, { TopBarSpacer } from '../../../../main/ui/layout/topBar/TopBar';
import Footer from '../../../../main/ui/platformFooter/PlatformFooter';
import FloatingActionButtons from '../../../../core/ui/button/FloatingActionButtons';
import PlatformHelpButton from '../../../../main/ui/helpButton/PlatformHelpButton';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import { NotFoundErrorBoundary } from '../../../../core/notfound/NotFoundErrorBoundary';

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
      <TopBar />
      <TopBarSpacer />
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
