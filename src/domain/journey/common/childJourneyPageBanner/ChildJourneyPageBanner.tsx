import JourneyPageBannerCard, {
  JourneyPageBannerCardProps,
} from '../PageBanner/JourneyPageBannerCard/JourneyPageBannerCard';
import PageBanner, { PageBannerProps } from '../../../../core/ui/layout/pageBanner/PageBanner';
import { useMemo } from 'react';
import defaultJourneyBanner from '../../defaultVisuals/Banner.jpg';

interface ChildJourneyPageBannerProps extends PageBannerProps, JourneyPageBannerCardProps {}

const ChildJourneyPageBanner = ({ banner, ...props }: ChildJourneyPageBannerProps) => {
  const spaceBanner = useMemo(() => {
    if (banner?.uri) {
      return banner;
    }
    return {
      ...banner,
      uri: defaultJourneyBanner,
    };
  }, [banner]);

  return <PageBanner banner={spaceBanner} cardComponent={JourneyPageBannerCard} {...props} />;
};

export default ChildJourneyPageBanner;
