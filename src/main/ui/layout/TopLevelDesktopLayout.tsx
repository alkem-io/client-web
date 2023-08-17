import React, { PropsWithChildren, ReactNode } from 'react';
import TopBar, { TopBarSpacer } from './topBar/TopBar';
import Footer from '../platformFooter/PlatformFooter';
import FloatingActionButtons from '../../../core/ui/button/FloatingActionButtons';
import PageContent from '../../../core/ui/content/PageContent';
import PlatformHelpButton from '../helpButton/PlatformHelpButton';

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
      <FloatingActionButtons floatingActions={floatingActions ?? <PlatformHelpButton />} />
    </>
  );
};

export default TopLevelDesktopLayout;
