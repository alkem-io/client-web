import React, { PropsWithChildren, ReactNode } from 'react';
import PlatformNavigationBar from '../platformNavigation/PlatformNavigationBar';
import Footer from '../platformFooter/PlatformFooter';
import FloatingActionButtons from '../../../core/ui/button/FloatingActionButtons';
import PlatformHelpButton from '../helpButton/PlatformHelpButton';

interface TopLevelDesktopLayoutProps {
  breadcrumbs?: ReactNode;
  header?: ReactNode;
  floatingActions?: ReactNode; // Defaults to the HelpButton
}

const TopLevelDesktopLayout = ({
  breadcrumbs,
  header,
  floatingActions,
  children,
}: PropsWithChildren<TopLevelDesktopLayoutProps>) => {
  return (
    <>
      <PlatformNavigationBar breadcrumbs={breadcrumbs} />
      {header}
      {children}
      <Footer />
      {floatingActions ?? <FloatingActionButtons floatingActions={<PlatformHelpButton />} />}
    </>
  );
};

export default TopLevelDesktopLayout;
