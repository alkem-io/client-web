import JourneyPageBannerCard, {
  JourneyPageBannerCardProps,
} from '../PageBanner/JourneyPageBannerCard/JourneyPageBannerCard';
import PageBanner, { PageBannerProps } from '../../../../core/ui/layout/pageBanner/PageBanner';

interface ChildJourneyPageBannerProps extends PageBannerProps, JourneyPageBannerCardProps {}

const ChildJourneyPageBanner = (props: ChildJourneyPageBannerProps) => {
  return <PageBanner cardComponent={JourneyPageBannerCard} {...props} />;
};

export default ChildJourneyPageBanner;
