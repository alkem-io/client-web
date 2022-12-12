import React, { PropsWithChildren } from 'react';
import { EntityPageLayoutProps } from './EntityPageLayoutTypes';
import TopBar, { TopBarSpacer } from '../../../../common/components/composite/layout/TopBar/TopBar';
import Footer from '../../../../common/components/composite/layout/App/Footer';
import { FloatingActionButtons } from '../../../../common/components/core';

const EntityPageLayoutDesktop = ({
  currentSection,
  children,
  pageBannerComponent: PageBanner,
  tabsComponent: Tabs,
}: PropsWithChildren<EntityPageLayoutProps>) => {
  return (
    <>
      <TopBar />
      <TopBarSpacer />
      <PageBanner />
      {Tabs && <Tabs currentTab={currentSection} />}
      {children}
      <Footer />
      <FloatingActionButtons />
    </>
  );
};

export default EntityPageLayoutDesktop;
