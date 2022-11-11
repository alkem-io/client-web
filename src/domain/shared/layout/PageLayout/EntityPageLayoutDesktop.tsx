import React, { PropsWithChildren } from 'react';
import SimplePageLayout from './SimplePageLayout';
import { EntityPageLayoutProps } from './EntityPageLayoutTypes';
import TopLevelDesktopLayout from './TopLevelDesktopLayout';

const EntityPageLayoutDesktop = ({
  currentSection,
  entityTypeName,
  tabDescriptionNs = 'pages',
  children,
  pageBannerComponent: PageBanner,
  tabsComponent: Tabs,
}: PropsWithChildren<EntityPageLayoutProps>) => {
  return (
    <TopLevelDesktopLayout>
      <PageBanner />
      {Tabs && <Tabs currentTab={currentSection} />}
      <SimplePageLayout
        currentSection={currentSection}
        entityTypeName={entityTypeName}
        tabDescriptionNs={tabDescriptionNs}
      >
        {children}
      </SimplePageLayout>
    </TopLevelDesktopLayout>
  );
};

export default EntityPageLayoutDesktop;
