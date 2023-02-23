import React, { PropsWithChildren, ReactNode } from 'react';
import TopBar, { TopBarSpacer } from '../../../../common/components/composite/layout/TopBar/TopBar';
import Footer from '../Footer/Footer';
import { FloatingActionButtons } from '../../../../common/components/core';
import PageContent from '../../content/PageContent';
import HelpButton from '../../../../common/components/core/FloatingActionButtons/HelpButton/HelpButton';

interface TopLevelDesktopLayoutProps {
  heading?: ReactNode;
  floatingActions?: ReactNode; // Defaults to the HelpButton
}

const TopLevelDesktopLayout = ({
  heading,
  floatingActions,
  children,
}: PropsWithChildren<TopLevelDesktopLayoutProps>) => {
  return (
    <>
      <TopBar />
      <TopBarSpacer />
      {heading}
      <PageContent>{children}</PageContent>
      <Footer />
      <FloatingActionButtons floatingActions={floatingActions ?? <HelpButton />} />
    </>
  );
};

export default TopLevelDesktopLayout;
