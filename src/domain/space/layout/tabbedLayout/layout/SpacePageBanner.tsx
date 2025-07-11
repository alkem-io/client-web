import { ReactNode, useState } from 'react';
import { Box, BoxProps, Link, Skeleton, styled, useTheme } from '@mui/material';
import useAutomaticTooltip from '@/domain/shared/utils/useAutomaticTooltip';
import { Caption, PageTitle, Tagline } from '@/core/ui/typography';
import ImageBlurredSides from '@/core/ui/image/ImageBlurredSides';
import { MAX_CONTENT_WIDTH_GUTTERS } from '@/core/ui/grid/constants';
import { gutters } from '@/core/ui/grid/utils';
import { SpaceLevel, SpaceVisibility, VisualType } from '@/core/apollo/generated/graphql-schema';
import { useSpace } from '../../../context/useSpace';
import { useConfig } from '@/domain/platform/config/useConfig';
import { TranslateWithElements } from '@/domain/shared/i18n/TranslateWithElements';
import { useTranslation } from 'react-i18next';
import { env } from '@/main/env';
import { getDefaultSpaceVisualUrl } from '../../../icons/defaultVisualUrls';
import { useSpaceAboutDetailsQuery } from '@/core/apollo/generated/apollo-hooks';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import useInnovationHubSpaceBannerRibbon from '@/domain/innovationHub/InnovationHubSpaceBannerRibbon/useInnovationHubSpaceBannerRibbon';

export const TITLE_HEIGHT = 6;

const ALKEMIO_DOMAIN = env?.VITE_APP_ALKEMIO_DOMAIN ?? '/';

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

// Placeholder at the top of the image to put notices and breadcrumbs
const TopNotices = styled(Box)(() => ({
  position: 'absolute',
  top: 0,
  width: '100%',
  zIndex: 30,
}));

interface PageNoticeProps extends BoxProps {
  level: SpacePageBannerProps['level'];
  isAdmin: SpacePageBannerProps['isAdmin'];
}

const PageNotice = ({ level, isAdmin, sx, ...boxProps }: PageNoticeProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const tLinks = TranslateWithElements(
    <Link underline="always" target="_blank" rel="noopener noreferrer" color={theme.palette.background.default} />
  );
  const { locations } = useConfig();
  const { visibility } = useSpace();

  if (visibility === SpaceVisibility.Active) return null;
  if (isAdmin) return null;

  let message: ReactNode = undefined;

  switch (level) {
    case SpaceLevel.L0: {
      if (visibility === SpaceVisibility.Archived) {
        message = tLinks('pages.generic.archivedNotice.archivedSpace', {
          contact: { href: locations?.feedback, target: '_blank' },
        });
      }
      if (visibility === SpaceVisibility.Demo) {
        message = tLinks('pages.generic.demoNotice.demoSpace', {
          alkemio: { href: ALKEMIO_DOMAIN, target: '_blank' },
        });
      }
      break;
    }
    default: {
      if (visibility === SpaceVisibility.Archived) {
        message = tLinks(
          'pages.generic.archivedNotice.archivedSubspace',
          {
            contact: { href: locations?.feedback, target: '_blank' },
          },
          { space: t(`common.space-level.${level || SpaceLevel.L0}`) }
        );
      }
      if (visibility === SpaceVisibility.Demo) {
        message = tLinks(
          'pages.generic.demoNotice.demoSubspace',
          {
            alkemio: { href: '/', target: '_blank' },
          },
          { space: t(`common.space-level.${level || SpaceLevel.L0}`) }
        );
      }
      break;
    }
  }

  if (!message) return null;

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        'a:hover': {
          color: theme.palette.common.white,
        },
        textAlign: 'center',
        padding: theme.spacing(0.5, 0),
        ...sx,
      }}
      {...boxProps}
    >
      <Caption>{message}</Caption>
    </Box>
  );
};

const WatermarkContainer = (props: BoxProps) => (
  <Box width={gutters(MAX_CONTENT_WIDTH_GUTTERS - 2)} maxWidth="100%" margin="auto" position="relative" {...props} />
);

export interface SpacePageBannerProps {
  loading?: boolean;
  level?: SpaceLevel;
  isAdmin?: boolean;
  watermark?: ReactNode;
  title?: string;
}

const SpacePageBanner = ({ level, isAdmin, loading: dataLoading = false, watermark, title }: SpacePageBannerProps) => {
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
      <TopNotices>
        <PageNotice level={level} isAdmin={isAdmin} />
      </TopNotices>
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
        <Tagline noWrap ref={element => addAutomaticTooltip(element)}>
          {profile?.tagline}
        </Tagline>
      </Title>
    </Root>
  );
};

export default SpacePageBanner;
