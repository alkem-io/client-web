import React, { PropsWithChildren, ReactNode } from 'react';
import TopBar, { TopBarSpacer } from '../../../../common/components/composite/layout/TopBar/TopBar';
import Footer from '../Footer/Footer';
import { FloatingActionButtons } from '../../../../common/components/core';
import PageContent from '../../content/PageContent';

interface TopLevelDesktopLayoutProps {
  heading?: ReactNode;
}

const TopLevelDesktopLayout = ({ heading, children }: PropsWithChildren<TopLevelDesktopLayoutProps>) => {
  return (
    <>
      <TopBar />
      <TopBarSpacer />
      {heading}
      <PageContent>{children}</PageContent>
      <Footer />
      <FloatingActionButtons />
    </>
  );
};

export default TopLevelDesktopLayout;
