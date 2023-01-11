import React, { PropsWithChildren } from 'react';
import { EntityPageLayoutProps } from './EntityPageLayoutTypes';
import { useMediaQuery, useTheme } from '@mui/material';
import TopBar, { TopBarSpacer } from '../../../../common/components/composite/layout/TopBar/TopBar';
import Footer from '../../../../core/ui/layout/Footer/Footer';
import { FloatingActionButtons } from '../../../../common/components/core';

const EntityPageLayout = ({
  currentSection,
  children,
  pageBannerComponent: PageBanner,
  tabsComponent: Tabs,
}: PropsWithChildren<EntityPageLayoutProps>) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  return (
    <>
      <TopBar />
      <TopBarSpacer />
      <PageBanner />
      {!isMobile && <Tabs currentTab={currentSection} />}
      {children}
      {isMobile && <Tabs currentTab={currentSection} mobile />}
      {!isMobile && (
        <>
          <Footer />
          <FloatingActionButtons />
        </>
      )}
    </>
  );
};

export default EntityPageLayout;
