import React, { PropsWithChildren, ReactNode } from 'react';
import PlatformNavigationBar from '../platformNavigation/PlatformNavigationBar';
import Footer from '../platformFooter/PlatformFooter';
import FloatingActionButtons from '../../../core/ui/button/FloatingActionButtons';
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
      <PlatformNavigationBar />
      {heading}
      {children}
      <Footer />
      <FloatingActionButtons floatingActions={floatingActions ?? <PlatformHelpButton />} />
    </>
  );
};

export default TopLevelDesktopLayout;
