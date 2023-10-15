import React, { PropsWithChildren, ReactNode } from 'react';
import PageBannerCard, { PageBannerCardProps } from '../../../topLevelPages/pageBannerCard/PageBannerCard';
import TopLevelDesktopLayout from '../TopLevelDesktopLayout';
import PageBanner from '../../../../core/ui/layout/pageBanner/PageBanner';
import { Visual } from '../../../../domain/common/visual/Visual';
import PageContent from '../../../../core/ui/content/PageContent';
import TopLevelPageBreadcrumbs from '../../../topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';

interface TopLevelPageLayoutProps extends PageBannerCardProps {
  ribbon?: ReactNode;
}

const banner: Visual = {
  uri: '/public/alkemio-banner/global-banner.jpg',
};

const TopLevelPageLayout = ({
  ribbon,
  children,
  iconComponent,
  title,
  ...props
}: PropsWithChildren<TopLevelPageLayoutProps>) => {
  const header = (
    <>
      <PageBanner
        banner={banner}
        cardComponent={PageBannerCard}
        iconComponent={iconComponent}
        title={title}
        {...props}
      />
      {ribbon}
    </>
  );

  return (
    <TopLevelDesktopLayout
      header={header}
      breadcrumbs={<TopLevelPageBreadcrumbs iconComponent={iconComponent}>{title}</TopLevelPageBreadcrumbs>}
    >
      <PageContent>{children}</PageContent>
    </TopLevelDesktopLayout>
  );
};

export default TopLevelPageLayout;
