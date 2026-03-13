import PageBanner from '@/core/ui/layout/pageBanner/PageBanner';
import type { Visual } from '@/domain/common/visual/Visual';
import PageBannerCard, { type PageBannerCardProps } from '@/main/topLevelPages/pageBannerCard/PageBannerCard';

export const defaultPageBanner: Visual = {
  uri: '/alkemio-banner/global-banner.svg',
};

interface TopLevelPageBannerProps extends PageBannerCardProps {}

const TopLevelPageBanner = (props: TopLevelPageBannerProps) => (
  <PageBanner {...props} banner={defaultPageBanner} cardComponent={PageBannerCard} />
);

export default TopLevelPageBanner;
