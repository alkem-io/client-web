import { SimplePageLayoutProps } from './SimplePageLayout';
import { EntityPageSection } from '../EntityPageSection';
import { ComponentType } from 'react';

export interface EntityTabsProps {
  currentTab: EntityPageSection;
  mobile?: boolean;
}

export interface EntityPageLayoutProps extends SimplePageLayoutProps<EntityPageSection> {
  pageBannerComponent: ComponentType;
  tabsComponent?: ComponentType<EntityTabsProps>;
}
