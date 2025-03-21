import { Box, Link, Skeleton, styled, useTheme } from '@mui/material';
import { ReactNode, useState } from 'react';
import useAutomaticTooltip from '@/domain/shared/utils/useAutomaticTooltip';
import { Caption, PageTitle, Tagline } from '@/core/ui/typography';
import ImageBlurredSides from '@/core/ui/image/ImageBlurredSides';
import { MAX_CONTENT_WIDTH_GUTTERS } from '@/core/ui/grid/constants';
import { gutters } from '@/core/ui/grid/utils';
import { SpaceLevel, SpaceVisibility, VisualType } from '@/core/apollo/generated/graphql-schema';
import { useSpace } from '../../../space/SpaceContext/useSpace';
import { useConfig } from '@/domain/platform/config/useConfig';
import { TranslateWithElements } from '@/domain/shared/i18n/TranslateWithElements';
import { BoxProps } from '@mui/system';
import { useTranslation } from 'react-i18next';
import { env } from '@/main/env';
import { BasePageBannerProps } from '@/domain/journey/common/EntityPageLayout/EntityPageLayoutTypes';
import { defaultVisualUrls } from '../../defaultVisuals/defaultVisualUrls';

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
  level: JourneyPageBannerProps['level'];
  isAdmin: JourneyPageBannerProps['isAdmin'];
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
        message = tLinks('pages.generic.archived-notice.archived-space', {
          contact: { href: locations?.feedback, target: '_blank' },
        });
      }
      if (visibility === SpaceVisibility.Demo) {
        message = tLinks('pages.generic.demo-notice.demo-space', {
          alkemio: { href: ALKEMIO_DOMAIN, target: '_blank' },
        });
      }
      break;
    }
    default: {
      if (visibility === SpaceVisibility.Archived) {
        message = tLinks(
          'pages.generic.archived-notice.archived-journey',
          {
            contact: { href: locations?.feedback, target: '_blank' },
          },
          { journey: t(`common.space-level.${level || SpaceLevel.L0}`) }
        );
      }
      if (visibility === SpaceVisibility.Demo) {
        message = tLinks(
          'pages.generic.demo-notice.demo-journey',
          {
            alkemio: { href: '/', target: '_blank' },
          },
          { journey: t(`common.space-level.${level || SpaceLevel.L0}`) }
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

export interface JourneyPageBannerProps extends BasePageBannerProps {
  title?: string;
  tagline?: string;
  bannerUrl?: string;
  bannerAltText?: string;
  ribbon?: ReactNode;
  loading?: boolean;
  level?: SpaceLevel;
  isAdmin?: boolean;
}

const SpacePageBanner = ({
  title,
  tagline,
  bannerUrl,
  bannerAltText,
  ribbon,
  level,
  isAdmin,
  loading: dataLoading = false,
  watermark,
}: JourneyPageBannerProps) => {
  const { t } = useTranslation();
  const { containerReference, addAutomaticTooltip } = useAutomaticTooltip();

  const [imageLoading, setImageLoading] = useState(true);

  const imageLoadError = () => {
    setImageLoading(false);
  };

  return (
    <Root ref={containerReference}>
      {ribbon}
      {imageLoading && <Skeleton variant="rectangular" animation="wave" sx={{ height: '100%' }} />}
      <TopNotices>
        <PageNotice level={level} isAdmin={isAdmin} />
      </TopNotices>
      <Box>
        <ImageBlurredSides
          src={bannerUrl || defaultVisualUrls[VisualType.Banner]}
          alt={t('visuals-alt-text.banner.page.text', { altText: bannerAltText })}
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
          {title}
          {!title && dataLoading && <Skeleton variant="text" animation="wave" />}
        </PageTitle>
        <Tagline noWrap ref={element => addAutomaticTooltip(element)}>
          {tagline}
        </Tagline>
      </Title>
    </Root>
  );
};

export default SpacePageBanner;
