import React, { PropsWithChildren } from 'react';
import TopBar, { TopBarSpacer } from '../../ui/layout/topBar/TopBar';
import Footer from '../../ui/platformFooter/PlatformFooter';
import FloatingActionButtons from '../../../core/ui/button/FloatingActionButtons';
import PlatformHelpButton from '../../ui/helpButton/PlatformHelpButton';

const HomePageLayout = ({ children }: PropsWithChildren<{}>) => {
  return (
    <>
      <TopBar />
      <TopBarSpacer />
      {children}
      <Footer />
      <FloatingActionButtons floatingActions={<PlatformHelpButton />} />
    </>
  );
};

export default HomePageLayout;
