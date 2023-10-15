import React, { PropsWithChildren, ReactNode } from 'react';
import PageBannerCard, { PageBannerCardProps } from '../../../topLevelPages/pageBannerCard/PageBannerCard';
import TopLevelDesktopLayout from '../TopLevelDesktopLayout';
import PageBanner from '../../../../core/ui/layout/pageBanner/PageBanner';

interface TopLevelPageLayoutProps extends PageBannerCardProps {
  ribbon?: ReactNode;
}

const TopLevelPageLayout = ({ ribbon, children, ...props }: PropsWithChildren<TopLevelPageLayoutProps>) => {
  const heading = (
    <>
      <PageBanner banner={undefined} cardComponent={PageBannerCard} {...props} />
      {ribbon}
    </>
  );

  return <TopLevelDesktopLayout heading={heading}>{children}</TopLevelDesktopLayout>;
};

export default TopLevelPageLayout;
