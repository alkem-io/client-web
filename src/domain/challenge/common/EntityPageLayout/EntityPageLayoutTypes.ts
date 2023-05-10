import { SimplePageLayoutProps } from '../../../platform/admin/layout/EntitySettingsLayout/SettingsPageContent';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { ComponentType, ReactNode } from 'react';

export interface EntityTabsProps {
  currentTab: EntityPageSection;
  mobile?: boolean;
}

export interface EntityPageLayoutProps extends SimplePageLayoutProps<EntityPageSection> {
  pageBannerComponent?: ComponentType;
  pageBanner?: ReactNode;
  tabsComponent: ComponentType<EntityTabsProps>;
}
