import React, { PropsWithChildren } from 'react';
import TopBar, { TopBarSpacer } from '../../../../common/components/composite/layout/TopBar/TopBar';
import Main from '../../../../common/components/composite/layout/App/Main';
import Footer from '../../../../common/components/composite/layout/App/Footer';
import { ScrollButton } from '../../../../common/components/core';

const TopLevelDesktopLayout = ({ children }: PropsWithChildren<{}>) => {
  return (
    <>
      <TopBar />
      <Main>
        <TopBarSpacer />
        {children}
      </Main>
      <Footer />
      <ScrollButton />
    </>
  );
};

export default TopLevelDesktopLayout;
