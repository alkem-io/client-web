import React, { ComponentType, PropsWithChildren } from 'react';
import SimplePageLayout, { SimplePageLayoutProps } from './SimplePageLayout';
import { EntityPageSection } from '../EntityPageSection';

export interface EntityTabsProps {
  currentTab: EntityPageSection;
}

export interface EntityPageLayoutProps extends SimplePageLayoutProps<EntityPageSection> {
  pageBannerComponent: ComponentType;
  tabsComponent?: ComponentType<EntityTabsProps>;
}

const EntityPageLayout = ({
  currentSection,
  entityTypeName,
  tabDescriptionNs = 'pages',
  children,
  pageBannerComponent: PageBanner,
  tabsComponent: Tabs,
}: PropsWithChildren<EntityPageLayoutProps>) => {
  return (
    <>
      <PageBanner />
      {Tabs && <Tabs currentTab={currentSection} />}
      <SimplePageLayout
        currentSection={currentSection}
        entityTypeName={entityTypeName}
        tabDescriptionNs={tabDescriptionNs}
      >
        {children}
      </SimplePageLayout>
    </>
  );
};

export default EntityPageLayout;
