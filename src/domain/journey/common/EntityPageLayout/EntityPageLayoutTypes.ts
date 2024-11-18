import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import { ComponentType, ReactElement, ReactNode } from 'react';
import { PlatformNavigationBarProps } from '@/main/ui/platformNavigation/PlatformNavigationBar';

export interface EntityTabsProps {
  currentTab: EntityPageSection;
  mobile?: boolean;
  onMenuOpen?: (open: boolean) => void;
}

export interface BasePageBannerProps {
  watermark?: ReactNode;
}

export interface EntityPageLayoutProps {
  currentSection: EntityPageSection;
  breadcrumbs?: PlatformNavigationBarProps['breadcrumbs'];
  pageBannerComponent?: ComponentType<BasePageBannerProps>;
  pageBanner?: ReactElement<BasePageBannerProps>;
  tabsComponent?: ComponentType<EntityTabsProps>;
  tabs?: ReactElement<Partial<EntityTabsProps>>;
}
