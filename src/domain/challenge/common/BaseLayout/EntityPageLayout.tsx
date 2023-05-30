import React, { ComponentType, PropsWithChildren, ReactNode } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import TopBar, { TopBarSpacer } from '../../../../common/components/composite/layout/TopBar/TopBar';
import Footer from '../../../platform/ui/PlatformFooter/PlatformFooter';
import { FloatingActionButtons } from '../../../../common/components/core';
import HelpButton from '../../../../common/components/core/FloatingActionButtons/HelpButton/HelpButton';

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
          <FloatingActionButtons floatingActions={<HelpButton />} />
        </>
      )}
    </>
  );
};

export default BasePageLayout;
