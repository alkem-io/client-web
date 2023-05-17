import React, { cloneElement, PropsWithChildren } from 'react';
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
  tabs: tabsElement,
}: PropsWithChildren<EntityPageLayoutProps>) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const tabs = Tabs ? (
    <Tabs currentTab={currentSection} mobile={isMobile} />
  ) : (
    tabsElement && cloneElement(tabsElement, { currentTab: currentSection, mobile: isMobile })
  );

  return (
    <>
      <TopBar />
      <TopBarSpacer />
      {PageBanner ? <PageBanner /> : pageBanner}
      {!isMobile && tabs}
      {children}
      {isMobile && tabs}
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
