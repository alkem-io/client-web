import type { PropsWithChildren, ReactNode } from 'react';
import PageContent from '@/core/ui/content/PageContent';
import type { PageBannerCardProps } from '@/main/topLevelPages/pageBannerCard/PageBannerCard';
import type { PlatformNavigationBarProps } from '@/main/ui/platformNavigation/PlatformNavigationBar';
import TopLevelLayout from '../TopLevelLayout';
import TopLevelPageBanner from './TopLevelPageBanner';

interface TopLevelPageLayoutProps extends PageBannerCardProps {
  ribbon?: ReactNode;
  breadcrumbs?: PlatformNavigationBarProps['breadcrumbs'];
}

const TopLevelPageLayout = ({
  ribbon,
  children,
  iconComponent,
  title,
  breadcrumbs,
  ...props
}: PropsWithChildren<TopLevelPageLayoutProps>) => {
  const header = (
    <>
      <TopLevelPageBanner title={title} iconComponent={iconComponent} {...props} />
      {ribbon}
    </>
  );

  return (
    <TopLevelLayout header={header} breadcrumbs={breadcrumbs}>
      <PageContent>{children}</PageContent>
    </TopLevelLayout>
  );
};

export default TopLevelPageLayout;
