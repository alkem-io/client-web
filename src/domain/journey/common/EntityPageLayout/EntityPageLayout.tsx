import React, { cloneElement, PropsWithChildren, useState } from 'react';
import { EntityPageLayoutProps } from './EntityPageLayoutTypes';
import { Theme, useMediaQuery } from '@mui/material';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import { NotFoundErrorBoundary } from '../../../../core/notFound/NotFoundErrorBoundary';
import TopLevelDesktopLayout from '../../../../main/ui/layout/TopLevelDesktopLayout';
import FloatingActionButtons from '../../../../core/ui/button/FloatingActionButtons';
import PlatformHelpButton from '../../../../main/ui/helpButton/PlatformHelpButton';
import { gutters } from '../../../../core/ui/grid/utils';

const EntityPageLayout = ({
  currentSection,
  breadcrumbs,
  pageBannerComponent: PageBanner,
  pageBanner,
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

  return (
    <NotFoundErrorBoundary
      errorComponent={
        <TopLevelDesktopLayout>
          <Error404 />
        </TopLevelDesktopLayout>
      }
    >
      <TopLevelDesktopLayout
        breadcrumbs={breadcrumbs}
        header={PageBanner ? <PageBanner /> : pageBanner}
        floatingActions={
          <FloatingActionButtons
            {...(isMobile ? { bottom: gutters(5) } : {})}
            visible={!isTabsMenuOpen}
            floatingActions={<PlatformHelpButton />}
          />
        }
      >
        {!isMobile && tabs}
        {children}
        {isMobile && tabs}
      </TopLevelDesktopLayout>
    </NotFoundErrorBoundary>
  );
};

export default EntityPageLayout;
