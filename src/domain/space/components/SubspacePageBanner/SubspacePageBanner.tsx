import SpacePageBannerCard from '../cards/components/SpacePageBannerCard';
import PageBanner, { PageBannerProps } from '@/core/ui/layout/pageBanner/PageBanner';
import { useMemo } from 'react';
import { defaultVisualUrls } from '@/domain/space/icons/defaultVisualUrls';
import { VisualType } from '@/core/apollo/generated/graphql-schema';
import { useSubspacePageBannerQuery } from '@/core/apollo/generated/apollo-hooks';

interface SubspacePageBannerProps extends Omit<PageBannerProps, 'banner'> {
  journeyId: string | undefined;
  levelZeroSpaceId: string | undefined;
}

const SubspacePageBanner = ({ journeyId, levelZeroSpaceId, ...props }: SubspacePageBannerProps) => {
  const { data } = useSubspacePageBannerQuery({
    variables: {
      level0Space: levelZeroSpaceId!,
      spaceId: journeyId!,
    },
    skip: !journeyId || !levelZeroSpaceId,
  });

  const bannerVisual = useMemo(() => {
    const spaceBanner = data?.lookup.level0Space?.about.profile.banner;
    if (data?.lookup.level0Space?.about.profile.banner?.uri) {
      return spaceBanner;
    }
    return {
      ...spaceBanner,
      uri: defaultVisualUrls[VisualType.Banner],
    };
  }, [data]);

  return (
    <PageBanner
      banner={bannerVisual}
      cardComponent={SpacePageBannerCard}
      displayName={data?.lookup.space?.about.profile.displayName ?? ''}
      tagline={data?.lookup.space?.about.profile.tagline ?? ''}
      avatar={data?.lookup.space?.about.profile.avatar}
      tags={data?.lookup.space?.about.profile.tagset?.tags}
      {...props}
    />
  );
};

export default SubspacePageBanner;
