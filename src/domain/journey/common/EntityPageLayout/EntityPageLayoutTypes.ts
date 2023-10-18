import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { ComponentType, ReactElement, ReactNode } from 'react';

export interface EntityTabsProps {
  currentTab: EntityPageSection;
  mobile?: boolean;
  onMenuOpen?: (open: boolean) => void;
}

export interface EntityPageLayoutProps {
  currentSection: EntityPageSection;
  breadcrumbs?: ReactNode;
  pageBannerComponent?: ComponentType;
  pageBanner?: ReactNode;
  tabsComponent?: ComponentType<EntityTabsProps>;
  tabs?: ReactElement<Partial<EntityTabsProps>>;
}
