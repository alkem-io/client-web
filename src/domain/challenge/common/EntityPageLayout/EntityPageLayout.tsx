import React, { cloneElement, PropsWithChildren } from 'react';
import { EntityPageLayoutProps } from './EntityPageLayoutTypes';
import { useMediaQuery, useTheme } from '@mui/material';
import BasePageLayout from '../BaseLayout/EntityPageLayout';

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
    <BasePageLayout {...props}>
      {!isMobile && tabs}
      {children}
      {isMobile && tabs}
    </BasePageLayout>
  );
};

export default EntityPageLayout;
