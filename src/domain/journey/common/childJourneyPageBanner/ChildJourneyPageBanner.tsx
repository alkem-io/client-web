import JourneyPageBannerCard from '../PageBanner/JourneyPageBannerCard/JourneyPageBannerCard';
import PageBanner, { PageBannerProps } from '../../../../core/ui/layout/pageBanner/PageBanner';
import { useMemo } from 'react';
import defaultJourneyBanner from '../../defaultVisuals/Banner.jpg';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';
import { useChildJourneyPageBannerQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { useSpace } from '../../space/SpaceContext/useSpace';
import { getVisualByType } from '../../../common/visual/utils/visuals.utils';
import { VisualName } from '../../../common/visual/constants/visuals.constants';

interface ChildJourneyPageBannerProps extends Omit<PageBannerProps, 'banner'> {}

const ChildJourneyPageBanner = (props: ChildJourneyPageBannerProps) => {
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

  const { journeyId, loading } = useRouteResolver();

  const { data } = useChildJourneyPageBannerQuery({
    variables: {
      spaceId: journeyId!,
    },
    skip: loading,
  });

  return (
    <PageBanner
      banner={bannerVisual}
      cardComponent={JourneyPageBannerCard}
      displayName={data?.space.profile.displayName ?? ''}
      tagline={data?.space.profile.tagline ?? ''}
      avatar={data?.space.profile.avatar}
      tags={data?.space.profile.tagset?.tags}
      {...props}
    />
  );
};

export default ChildJourneyPageBanner;
