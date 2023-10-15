import React, { PropsWithChildren, ReactNode } from 'react';
import PageBannerCard, { PageBannerCardProps } from '../../../topLevelPages/pageBannerCard/PageBannerCard';
import TopLevelDesktopLayout from '../TopLevelDesktopLayout';
import PageBanner from '../../../../core/ui/layout/pageBanner/PageBanner';
import { Visual } from '../../../../domain/common/visual/Visual';
import PageContent from '../../../../core/ui/content/PageContent';

interface TopLevelPageLayoutProps extends PageBannerCardProps {
  ribbon?: ReactNode;
}

const banner: Visual = {
  uri: '/public/alkemio-banner/global-banner.jpg',
};

const TopLevelPageLayout = ({ ribbon, children, ...props }: PropsWithChildren<TopLevelPageLayoutProps>) => {
  const heading = (
    <>
      <PageBanner banner={banner} cardComponent={PageBannerCard} {...props} />
      {ribbon}
    </>
  );

  return (
    <TopLevelDesktopLayout heading={heading}>
      <PageContent>{children}</PageContent>
    </TopLevelDesktopLayout>
  );
};

export default TopLevelPageLayout;
