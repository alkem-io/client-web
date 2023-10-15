import React, { PropsWithChildren } from 'react';
import Footer from '../../ui/platformFooter/PlatformFooter';
import FloatingActionButtons from '../../../core/ui/button/FloatingActionButtons';
import PlatformHelpButton from '../../ui/helpButton/PlatformHelpButton';
import PlatformNavigationBar from '../../ui/platformNavigation/PlatformNavigationBar';
import PageBanner from '../../../core/ui/layout/pageBanner/PageBanner';
import { Box } from '@mui/material';

const HomePageLayout = ({ children }: PropsWithChildren<{}>) => {
  return (
    <>
      <PlatformNavigationBar />
      <PageBanner banner={undefined} cardComponent={Box} />
      {children}
      <Footer />
      <FloatingActionButtons floatingActions={<PlatformHelpButton />} />
    </>
  );
};

export default HomePageLayout;
