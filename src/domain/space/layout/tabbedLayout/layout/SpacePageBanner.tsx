import { ReactNode, useState } from 'react';
import { Box, BoxProps, Skeleton, styled } from '@mui/material';
import useAutomaticTooltip from '@/domain/shared/utils/useAutomaticTooltip';
import { PageTitle, Tagline } from '@/core/ui/typography';
import ImageBlurredSides from '@/core/ui/image/ImageBlurredSides';
import { MAX_CONTENT_WIDTH_GUTTERS } from '@/core/ui/grid/constants';
import { gutters } from '@/core/ui/grid/utils';
import { SpaceLevel, VisualType } from '@/core/apollo/generated/graphql-schema';
import { useSpace } from '../../../context/useSpace';
import { useTranslation } from 'react-i18next';
import { getDefaultSpaceVisualUrl } from '../../../icons/defaultVisualUrls';
import { useSpaceAboutDetailsQuery } from '@/core/apollo/generated/apollo-hooks';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import useInnovationHubSpaceBannerRibbon from '@/domain/innovationHub/InnovationHubSpaceBannerRibbon/useInnovationHubSpaceBannerRibbon';

export const TITLE_HEIGHT = 6;

const Root = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.neutralLight.main,
}));

const Title = styled(Box)(({ theme }) => ({
  color: theme.palette.common.white,
  backgroundColor: theme.palette.space.dark,
  position: 'relative',
  width: '100%',
  textAlign: 'center',
  zIndex: 20,
  display: 'flex',
  flexDirection: 'column',
  height: theme.spacing(TITLE_HEIGHT),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  justifyContent: 'space-evenly',
}));

const WatermarkContainer = (props: BoxProps) => (
  <Box width={gutters(MAX_CONTENT_WIDTH_GUTTERS - 2)} maxWidth="100%" margin="auto" position="relative" {...props} />
);

export interface SpacePageBannerProps {
  loading?: boolean;
  isAdmin?: boolean;
  watermark?: ReactNode;
  title?: string;
}

const SpacePageBanner = ({ isAdmin, loading: dataLoading = false, watermark, title }: SpacePageBannerProps) => {
  const { spaceLevel } = useUrlResolver();
  const { t } = useTranslation();
  const { containerReference, addAutomaticTooltip } = useAutomaticTooltip();
  const [imageLoading, setImageLoading] = useState(true);

  const {
    space: { id: spaceId },
  } = useSpace();

  const { data, loading } = useSpaceAboutDetailsQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: !spaceId || dataLoading,
  });

  const profile = data?.lookup.space?.about.profile;

  const bannerTitle = title ?? profile?.displayName;
  const ribbon = useInnovationHubSpaceBannerRibbon({
    spaceId,
  });

  const imageLoadError = () => {
    setImageLoading(false);
  };

  // when current space is not L0 hide the L0 space banner
  // space page banner is used by global administration as well - it's layout is raising the flag and then the banner needs to be displayed always
  if (!isAdmin && spaceLevel !== SpaceLevel.L0) {
    return null;
  }

  return (
    <Root ref={containerReference}>
      {ribbon}
      {imageLoading && <Skeleton variant="rectangular" animation="wave" sx={{ height: '100%' }} />}
      <Box>
        <ImageBlurredSides
          src={profile?.banner?.uri || getDefaultSpaceVisualUrl(VisualType.Banner, spaceId)}
          alt={t('visuals-alt-text.banner.page.text', { altText: profile?.banner?.alternativeText })}
          onLoad={() => setImageLoading(false)}
          onError={imageLoadError}
          blurRadius={2}
          height={theme => theme.spacing(18)}
          width={gutters(MAX_CONTENT_WIDTH_GUTTERS - 2)}
          maxWidth="100%"
        />
        <WatermarkContainer>{watermark}</WatermarkContainer>
      </Box>
      <Title>
        <PageTitle noWrap ref={element => addAutomaticTooltip(element)}>
          {bannerTitle}
          {!bannerTitle && (dataLoading || loading) && <Skeleton variant="text" animation="wave" />}
        </PageTitle>
        {profile?.tagline ? (
          <Tagline noWrap ref={element => addAutomaticTooltip(element)}>
            {profile?.tagline}
          </Tagline>
        ) : null}
      </Title>
    </Root>
  );
};

export default SpacePageBanner;
