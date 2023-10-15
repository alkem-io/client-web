import React, { cloneElement, PropsWithChildren } from 'react';
import { EntityPageLayoutProps } from './EntityPageLayoutTypes';
import { useMediaQuery, useTheme } from '@mui/material';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import { NotFoundErrorBoundary } from '../../../../core/notFound/NotFoundErrorBoundary';
import TopLevelDesktopLayout from '../../../../main/ui/layout/TopLevelDesktopLayout';

const EntityPageLayout = ({
  currentSection,
  pageBannerComponent: PageBanner,
  pageBanner,
  tabsComponent: Tabs,
  tabs: tabsElement,
  children,
}: PropsWithChildren<EntityPageLayoutProps>) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const tabs = Tabs ? (
    <Tabs currentTab={currentSection} mobile={isMobile} />
  ) : (
    tabsElement && cloneElement(tabsElement, { currentTab: currentSection, mobile: isMobile })
  );

  return (
    <NotFoundErrorBoundary
      errorComponent={
        <TopLevelDesktopLayout>
          <Error404 />
        </TopLevelDesktopLayout>
      }
    >
      <TopLevelDesktopLayout heading={PageBanner ? <PageBanner /> : pageBanner}>
        {!isMobile && tabs}
        {children}
        {isMobile && tabs}
      </TopLevelDesktopLayout>
    </NotFoundErrorBoundary>
  );
};

export default EntityPageLayout;
