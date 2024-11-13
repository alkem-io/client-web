import JourneyPageBannerCard from '../PageBanner/JourneyPageBannerCard/JourneyPageBannerCard';
import PageBanner, { PageBannerProps } from '@core/ui/layout/pageBanner/PageBanner';
import { useMemo } from 'react';
import defaultJourneyBanner from '../../defaultVisuals/Banner.jpg';
import { useChildJourneyPageBannerQuery } from '@core/apollo/generated/apollo-hooks';
import { useSpace } from '../../space/SpaceContext/useSpace';
import { getVisualByType } from '../../../common/visual/utils/visuals.utils';
import { VisualName } from '../../../common/visual/constants/visuals.constants';

interface ChildJourneyPageBannerProps extends Omit<PageBannerProps, 'banner'> {
  journeyId: string | undefined;
}

const ChildJourneyPageBanner = ({ journeyId, ...props }: ChildJourneyPageBannerProps) => {
  const { profile: spaceProfile } = useSpace();
  const spaceBanner = getVisualByType(VisualName.BANNER, spaceProfile?.visuals);

  const bannerVisual = useMemo(() => {
    if (spaceBanner?.uri) {
      return spaceBanner;
    }
    return {
      ...spaceBanner,
      uri: defaultJourneyBanner,
    };
  }, [spaceBanner]);

  const { data } = useChildJourneyPageBannerQuery({
    variables: {
      spaceId: journeyId!,
    },
    skip: !journeyId,
  });

  return (
    <PageBanner
      banner={bannerVisual}
      cardComponent={JourneyPageBannerCard}
      displayName={data?.lookup.space?.profile.displayName ?? ''}
      tagline={data?.lookup.space?.profile.tagline ?? ''}
      avatar={data?.lookup.space?.profile.avatar}
      tags={data?.lookup.space?.profile.tagset?.tags}
      {...props}
    />
  );
};

export default ChildJourneyPageBanner;
