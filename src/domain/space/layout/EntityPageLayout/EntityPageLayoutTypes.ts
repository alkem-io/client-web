import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { PlatformNavigationBarProps } from '@/main/ui/platformNavigation/PlatformNavigationBar';
import { ComponentType, PropsWithChildren, ReactElement, ReactNode } from 'react';

export interface EntityTabsProps {
  currentTab: { sectionIndex: number } | { section: EntityPageSection } | undefined;
  mobile?: boolean;
  onMenuOpen?: (open: boolean) => void;
  loading?: boolean;
}

export interface BasePageBannerProps {
  watermark?: ReactNode;
}

export interface EntityPageLayoutProps extends PropsWithChildren {
  currentSection?: { sectionIndex: number } | { section: EntityPageSection };
  breadcrumbs?: PlatformNavigationBarProps['breadcrumbs'];
  pageBannerComponent?: ComponentType<BasePageBannerProps>;
  pageBanner?: ReactElement<BasePageBannerProps>;
  tabsComponent?: ComponentType<EntityTabsProps>;
  tabs?: ReactElement<Partial<EntityTabsProps>>;
}
