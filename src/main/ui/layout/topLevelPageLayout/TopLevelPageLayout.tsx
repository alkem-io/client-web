import { PropsWithChildren, ReactNode } from 'react';
import { PageBannerCardProps } from '@/main/topLevelPages/pageBannerCard/PageBannerCard';
import TopLevelLayout from '../TopLevelLayout';
import PageContent from '@/core/ui/content/PageContent';
import TopLevelPageBanner from './TopLevelPageBanner';
import { PlatformNavigationBarProps } from '@/main/ui/platformNavigation/PlatformNavigationBar';

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
