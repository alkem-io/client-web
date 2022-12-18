import React, { PropsWithChildren } from 'react';
import { EntityPageLayoutProps } from './EntityPageLayoutTypes';
import TopBar, { TopBarSpacer } from '../../../../common/components/composite/layout/TopBar/TopBar';

const EntityPageLayoutMobile = ({
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
      {children}
      {Tabs && <Tabs currentTab={currentSection} mobile />}
    </>
  );
};

export default EntityPageLayoutMobile;
