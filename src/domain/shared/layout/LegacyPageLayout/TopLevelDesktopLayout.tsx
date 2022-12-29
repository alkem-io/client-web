import React, { PropsWithChildren } from 'react';
import TopBar, { TopBarSpacer } from '../../../../common/components/composite/layout/TopBar/TopBar';
import Footer from '../../../../core/ui/layout/Footer/Footer';
import { FloatingActionButtons } from '../../../../common/components/core';
import PageContent from '../../../../core/ui/content/PageContent';

/**
 * @deprecated - left for compatibility with Pages that haven't been updated to the new design yet
 */
const TopLevelDesktopLayout = ({ children }: PropsWithChildren<{}>) => {
  return (
    <>
      <TopBar />
      <TopBarSpacer />
      <PageContent>{children}</PageContent>
      <Footer />
      <FloatingActionButtons />
    </>
  );
};

export default TopLevelDesktopLayout;
