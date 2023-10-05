import React, { cloneElement, PropsWithChildren } from 'react';
import { EntityPageLayoutProps } from './EntityPageLayoutTypes';
import { useMediaQuery, useTheme } from '@mui/material';
import BasePageLayout from '../BaseLayout/EntityPageLayout';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import { NotFoundErrorBoundary } from '../../../../core/notfound/NotFoundErrorBoundary';
import TopLevelDesktopLayout from '../../../../main/ui/layout/TopLevelDesktopLayout';

const EntityPageLayout = ({
  currentSection,
  tabsComponent: Tabs,
  tabs: tabsElement,
  children,
  ...props
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
      <BasePageLayout {...props}>
        {!isMobile && tabs}
        {children}
        {isMobile && tabs}
      </BasePageLayout>
    </NotFoundErrorBoundary>
  );
};

export default EntityPageLayout;
