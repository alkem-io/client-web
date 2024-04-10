import React from 'react';
import PageBanner from '../../../../core/ui/layout/pageBanner/PageBanner';
import PageBannerCard, { PageBannerCardProps } from '../../../topLevelPages/pageBannerCard/PageBannerCard';
import { Visual } from '../../../../domain/common/visual/Visual';

const banner: Visual = {
  uri: '/alkemio-banner/global-banner.jpg',
};

interface TopLevelPageBannerProps extends PageBannerCardProps {}

const TopLevelPageBanner = (props: TopLevelPageBannerProps) => {
  return <PageBanner banner={banner} cardComponent={PageBannerCard} {...props} />;
};

export default TopLevelPageBanner;
