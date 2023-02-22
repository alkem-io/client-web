import React, { PropsWithChildren, ReactNode } from 'react';
import TopBar, { TopBarSpacer } from '../../../../common/components/composite/layout/TopBar/TopBar';
import Footer from '../Footer/Footer';
import { FloatingActionButtons } from '../../../../common/components/core';
import PageContent from '../../content/PageContent';

interface TopLevelDesktopLayoutProps {
  heading?: ReactNode;
  floatingButtons?: ReactNode;
}

const TopLevelDesktopLayout = ({
  heading,
  floatingButtons,
  children,
}: PropsWithChildren<TopLevelDesktopLayoutProps>) => {
  return (
    <>
      <TopBar />
      <TopBarSpacer />
      {heading}
      <PageContent>{children}</PageContent>
      <Footer />
      <FloatingActionButtons>{floatingButtons}</FloatingActionButtons>
    </>
  );
};

export default TopLevelDesktopLayout;
