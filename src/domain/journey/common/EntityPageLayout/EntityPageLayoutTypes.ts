import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { ComponentType, ReactElement, ReactNode } from 'react';
import { EntityTypeName } from '../../../platform/constants/EntityTypeName';

export interface EntityTabsProps {
  currentTab: EntityPageSection;
  mobile?: boolean;
}

export interface EntityPageLayoutProps {
  currentSection: EntityPageSection;
  entityTypeName: EntityTypeName;
  breadcrumbs?: ReactNode;
  pageBannerComponent?: ComponentType;
  pageBanner?: ReactNode;
  tabsComponent?: ComponentType<EntityTabsProps>;
  tabs?: ReactElement<Partial<EntityTabsProps>>;
}
