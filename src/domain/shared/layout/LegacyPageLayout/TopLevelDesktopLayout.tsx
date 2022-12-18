import React, { PropsWithChildren } from 'react';
import TopBar, { TopBarSpacer } from '../../../../common/components/composite/layout/TopBar/TopBar';
import Main from '../../../../common/components/composite/layout/App/Main';
import Footer from '../../../../core/ui/layout/Footer/Footer';
import { FloatingActionButtons } from '../../../../common/components/core';

/**
 * @deprecated - left for compatibility with Pages that haven't been updated to the new design yet
 */
const TopLevelDesktopLayout = ({ children }: PropsWithChildren<{}>) => {
  return (
    <>
      <TopBar />
      <Main>
        <TopBarSpacer />
        {children}
      </Main>
      <Footer />
      <FloatingActionButtons />
    </>
  );
};

export default TopLevelDesktopLayout;
