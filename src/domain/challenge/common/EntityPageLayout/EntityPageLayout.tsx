import React, { PropsWithChildren } from 'react';
import { EntityPageLayoutProps } from './EntityPageLayoutTypes';
import { useMediaQuery, useTheme } from '@mui/material';
import TopBar, { TopBarSpacer } from '../../../../common/components/composite/layout/TopBar/TopBar';
import Footer from '../../../platform/ui/PlatformFooter/PlatformFooter';
import { FloatingActionButtons } from '../../../../common/components/core';
import HelpButton from '../../../../common/components/core/FloatingActionButtons/HelpButton/HelpButton';

const EntityPageLayout = ({
  currentSection,
  children,
  pageBannerComponent: PageBanner,
  pageBanner,
  tabsComponent: Tabs,
}: PropsWithChildren<EntityPageLayoutProps>) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  return (
    <>
      <TopBar />
      <TopBarSpacer />
      {PageBanner ? <PageBanner /> : pageBanner}
      {!isMobile && <Tabs currentTab={currentSection} />}
      {children}
      {isMobile && <Tabs currentTab={currentSection} mobile />}
      {!isMobile && (
        <>
          <Footer />
          <FloatingActionButtons floatingActions={<HelpButton />} />
        </>
      )}
    </>
  );
};

export default EntityPageLayout;
