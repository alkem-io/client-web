import React, { cloneElement, PropsWithChildren, useState } from 'react';
import { EntityPageLayoutProps } from './EntityPageLayoutTypes';
import { Theme, useMediaQuery } from '@mui/material';
import { Error404 } from '@/core/pages/Errors/Error404';
import { NotFoundErrorBoundary } from '@/core/notFound/NotFoundErrorBoundary';
import TopLevelLayout from '../../../../main/ui/layout/TopLevelLayout';
import FloatingActionButtons from '@/core/ui/button/FloatingActionButtons';
import PlatformHelpButton from '../../../../main/ui/helpButton/PlatformHelpButton';
import { gutters } from '@/core/ui/grid/utils';
import PageBannerWatermark from '../../../../main/ui/platformNavigation/PageBannerWatermark';

const EntityPageLayout = ({
  currentSection,
  breadcrumbs,
  pageBannerComponent: PageBanner,
  pageBanner: pageBannerElement,
  tabsComponent: Tabs,
  tabs: tabsElement,
  children,
}: PropsWithChildren<EntityPageLayoutProps>) => {
  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('lg'));
  const [isTabsMenuOpen, setTabsMenuOpen] = useState(false);

  const tabs = Tabs ? (
    <Tabs currentTab={currentSection} mobile={isMobile} onMenuOpen={setTabsMenuOpen} />
  ) : (
    tabsElement &&
    cloneElement(tabsElement, { currentTab: currentSection, mobile: isMobile, onMenuOpen: setTabsMenuOpen })
  );

  const pageBannerWatermark = isMobile ? null : <PageBannerWatermark />;

  const pageBanner = PageBanner ? (
    <PageBanner watermark={pageBannerWatermark} />
  ) : (
    pageBannerElement && cloneElement(pageBannerElement, { watermark: pageBannerWatermark })
  );

  return (
    <NotFoundErrorBoundary
      errorComponent={
        <TopLevelLayout>
          <Error404 />
        </TopLevelLayout>
      }
    >
      <TopLevelLayout
        breadcrumbs={breadcrumbs}
        header={PageBanner ? <PageBanner watermark={pageBannerWatermark} /> : pageBanner}
        floatingActions={
          <FloatingActionButtons
            {...(isMobile ? { bottom: gutters(3) } : {})}
            visible={!isTabsMenuOpen}
            floatingActions={<PlatformHelpButton />}
          />
        }
        addWatermark={isMobile}
      >
        {!isMobile && tabs}
        {children}
        {isMobile && tabs}
      </TopLevelLayout>
    </NotFoundErrorBoundary>
  );
};

export default EntityPageLayout;
