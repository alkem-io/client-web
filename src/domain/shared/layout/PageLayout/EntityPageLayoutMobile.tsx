import React, { PropsWithChildren } from 'react';
import { EntityPageLayoutProps } from './EntityPageLayoutTypes';
import TopBar, { TopBarSpacer } from '../../../../common/components/composite/layout/TopBar/TopBar';
import Main from '../../../../common/components/composite/layout/App/Main';

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
      <Main sx={{ marginTop: 2, marginBottom: 9 }}>{children}</Main>
      {Tabs && <Tabs currentTab={currentSection} mobile />}
    </>
  );
};

export default EntityPageLayoutMobile;
