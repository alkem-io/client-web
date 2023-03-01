import React, { PropsWithChildren } from 'react';
import TopBar, { TopBarSpacer } from '../../../../common/components/composite/layout/TopBar/TopBar';
import Footer from '../../../../core/ui/layout/Footer/Footer';
import { FloatingActionButtons } from '../../../../common/components/core';
import HelpButton from '../../../../common/components/core/FloatingActionButtons/HelpButton/HelpButton';

const HomePageLayout = ({ children }: PropsWithChildren<{}>) => {
  return (
    <>
      <TopBar />
      <TopBarSpacer />
      {children}
      <Footer />
      <FloatingActionButtons floatingActions={<HelpButton />} />
    </>
  );
};

export default HomePageLayout;
