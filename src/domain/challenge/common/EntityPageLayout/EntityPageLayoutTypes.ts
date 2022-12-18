import { SimplePageLayoutProps } from '../../../shared/layout/LegacyPageLayout/SimplePageLayout';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { ComponentType } from 'react';

export interface EntityTabsProps {
  currentTab: EntityPageSection;
  mobile?: boolean;
}

export interface EntityPageLayoutProps extends SimplePageLayoutProps<EntityPageSection> {
  pageBannerComponent: ComponentType;
  tabsComponent?: ComponentType<EntityTabsProps>;
}
