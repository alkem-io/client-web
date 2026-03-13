import { useMemo } from 'react';
import { useSubspacePageBannerQuery } from '@/core/apollo/generated/apollo-hooks';
import { SpaceLevel, VisualType } from '@/core/apollo/generated/graphql-schema';
import PageBanner from '@/core/ui/layout/pageBanner/PageBanner';
import { getDefaultSpaceVisualUrl } from '@/domain/space/icons/defaultVisualUrls';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import SpacePageBannerCard from '../cards/components/SpacePageBannerCard';

const SubspacePageBanner = () => {
  const { spaceId, spaceLevel, levelZeroSpaceId } = useUrlResolver();

  const { data } = useSubspacePageBannerQuery({
    variables: {
      level0Space: levelZeroSpaceId!,
      spaceId: spaceId!,
    },
    skip: !spaceId || !levelZeroSpaceId,
    returnPartialData: true,
  });

  const bannerVisual = useMemo(() => {
    const spaceBanner = data?.lookup.level0Space?.about?.profile.banner;
    if (data?.lookup.level0Space?.about?.profile.banner?.uri) {
      return spaceBanner;
    }
    return {
      ...spaceBanner,
      uri: getDefaultSpaceVisualUrl(VisualType.Banner, levelZeroSpaceId),
    };
  }, [data?.lookup.level0Space?.about?.profile.banner?.id, levelZeroSpaceId]);

  if (spaceLevel === SpaceLevel.L0) {
    return null;
  }

  return (
    <PageBanner
      banner={bannerVisual}
      cardComponent={SpacePageBannerCard}
      spaceId={spaceId}
      displayName={data?.lookup.space?.about?.profile.displayName ?? ''}
      tagline={data?.lookup.space?.about?.profile.tagline ?? ''}
      avatar={data?.lookup.space?.about?.profile.avatar}
      tags={data?.lookup.space?.about?.profile.tagset?.tags}
    />
  );
};

export default SubspacePageBanner;
