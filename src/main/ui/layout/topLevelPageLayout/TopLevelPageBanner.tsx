import { Visual } from '@domain/common/visual/Visual';
import PageBanner from '@core/ui/layout/pageBanner/PageBanner';
import PageBannerCard, { PageBannerCardProps } from '../../../topLevelPages/pageBannerCard/PageBannerCard';

const banner: Visual = {
  uri: '/alkemio-banner/global-banner.jpg',
};

interface TopLevelPageBannerProps extends PageBannerCardProps {}

const TopLevelPageBanner = (props: TopLevelPageBannerProps) => {
  return <PageBanner {...props} banner={banner} cardComponent={PageBannerCard} />;
};

export default TopLevelPageBanner;
