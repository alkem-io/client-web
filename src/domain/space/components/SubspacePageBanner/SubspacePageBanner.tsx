import SpacePageBannerCard from '../cards/components/SpacePageBannerCard';
import PageBanner from '@/core/ui/layout/pageBanner/PageBanner';
import { useMemo } from 'react';
import { getDefaultSpaceVisualUrl } from '@/domain/space/icons/defaultVisualUrls';
import { SpaceLevel, VisualType } from '@/core/apollo/generated/graphql-schema';
import { useSubspacePageBannerQuery } from '@/core/apollo/generated/apollo-hooks';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

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
  }, [data?.lookup.level0Space?.about?.profile.banner?.id]);

  if (spaceLevel === SpaceLevel.L0) {
    return null;
  }

  return (
    <PageBanner
      banner={bannerVisual}
      cardComponent={SpacePageBannerCard}
      levelZeroSpaceId={levelZeroSpaceId}
      displayName={data?.lookup.space?.about?.profile.displayName ?? ''}
      tagline={data?.lookup.space?.about?.profile.tagline ?? ''}
      avatar={data?.lookup.space?.about?.profile.avatar}
      tags={data?.lookup.space?.about?.profile.tagset?.tags}
    />
  );
};

export default SubspacePageBanner;
