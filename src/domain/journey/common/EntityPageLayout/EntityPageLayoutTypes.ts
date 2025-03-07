import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { PlatformNavigationBarProps } from '@/main/ui/platformNavigation/PlatformNavigationBar';
import { ComponentType, PropsWithChildren, ReactElement, ReactNode } from 'react';

export interface EntityTabsProps {
  currentTab: EntityPageSection;
  mobile?: boolean;
  onMenuOpen?: (open: boolean) => void;
}

export interface BasePageBannerProps {
  watermark?: ReactNode;
}

export interface EntityPageLayoutProps extends PropsWithChildren {
  currentSection: EntityPageSection;
  breadcrumbs?: PlatformNavigationBarProps['breadcrumbs'];
  pageBannerComponent?: ComponentType<BasePageBannerProps>;
  pageBanner?: ReactElement<BasePageBannerProps>;
  tabsComponent?: ComponentType<EntityTabsProps>;
  tabs?: ReactElement<Partial<EntityTabsProps>>;
}
