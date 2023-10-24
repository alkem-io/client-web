import { Box, Link, Skeleton, styled, useTheme } from '@mui/material';
import { FC, ReactNode, useState } from 'react';
import useAutomaticTooltip from '../../../shared/utils/useAutomaticTooltip';
import { JourneyTypeName } from '../../JourneyTypeName';
import { Caption, PageTitle, Tagline } from '../../../../core/ui/typography';
import ImageBlurredSides from '../../../../core/ui/image/ImageBlurredSides';
import { MAX_CONTENT_WIDTH_GUTTERS } from '../../../../core/ui/grid/constants';
import { gutters } from '../../../../core/ui/grid/utils';
import { SpaceVisibility } from '../../../../core/apollo/generated/graphql-schema';
import { useSpace } from '../SpaceContext/useSpace';
import { useConfig } from '../../../platform/config/useConfig';
import { TranslateWithElements } from '../../../shared/i18n/TranslateWithElements';
import { BoxProps } from '@mui/system';
import { useTranslation } from 'react-i18next';
import { env } from '../../../../main/env';
import { BasePageBannerProps } from '../../common/EntityPageLayout/EntityPageLayoutTypes';
import { COLOR_HUB } from '../../../../core/ui/palette/palette';

export const DEFAULT_BANNER_URL = '/alkemio-banner/alkemio-banner-xl.png';
export const TITLE_HEIGHT = 6;

const ALKEMIO_DOMAIN = env?.VITE_APP_ALKEMIO_DOMAIN ?? '/';

const Root = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.neutralLight.main,
}));

const Title = styled(Box)(({ theme }) => ({
  color: theme.palette.common.white,
  backgroundColor: COLOR_HUB,
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
  journeyTypeName: JourneyPageBannerProps['journeyTypeName'];
}

const PageNotice: FC<PageNoticeProps> = ({ journeyTypeName, sx, ...boxProps }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const tLinks = TranslateWithElements(
    <Link underline="always" target="_blank" rel="noopener noreferrer" color={theme.palette.background.default} />
  );
  const { platform } = useConfig();
  const { visibility: spaceVisibility } = useSpace();

  if (spaceVisibility === SpaceVisibility.Active) return null;
  if (journeyTypeName === 'admin') return null;

  let message: ReactNode = undefined;

  switch (journeyTypeName) {
    case 'space': {
      if (spaceVisibility === SpaceVisibility.Archived) {
        message = tLinks('pages.generic.archived-notice.archived-space', {
          contact: { href: platform?.feedback, target: '_blank' },
        });
      }
      if (spaceVisibility === SpaceVisibility.Demo) {
        message = tLinks('pages.generic.demo-notice.demo-space', {
          alkemio: { href: ALKEMIO_DOMAIN, target: '_blank' },
        });
      }
      break;
    }
    default: {
      if (spaceVisibility === SpaceVisibility.Archived) {
        message = tLinks(
          'pages.generic.archived-notice.archived-journey',
          {
            contact: { href: platform?.feedback, target: '_blank' },
          },
          { journey: t(`common.${journeyTypeName}` as const) }
        );
      }
      if (spaceVisibility === SpaceVisibility.Demo) {
        message = tLinks(
          'pages.generic.demo-notice.demo-journey',
          {
            alkemio: { href: '/', target: '_blank' },
          },
          { journey: t(`common.${journeyTypeName}` as const) }
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

const WatermarkContainer = (props: BoxProps) => {
  return (
    <Box width={gutters(MAX_CONTENT_WIDTH_GUTTERS - 2)} maxWidth="100%" margin="auto" position="relative" {...props} />
  );
};

export interface JourneyPageBannerProps extends BasePageBannerProps {
  title?: string;
  tagline?: string;
  bannerUrl?: string;
  bannerAltText?: string;
  ribbon?: ReactNode;
  loading?: boolean;
  journeyTypeName: JourneyTypeName | 'admin';
}

const SpacePageBanner: FC<JourneyPageBannerProps> = ({
  title,
  tagline,
  bannerUrl,
  bannerAltText,
  ribbon,
  journeyTypeName,
  loading: dataLoading = false,
  watermark,
}) => {
  const { t } = useTranslation();
  const { containerReference, addAutomaticTooltip } = useAutomaticTooltip();
  bannerUrl = bannerUrl || DEFAULT_BANNER_URL;

  const [imageLoading, setImageLoading] = useState(true);

  const imageLoadError = () => {
    setImageLoading(false);
  };

  return (
    <Root ref={containerReference}>
      {ribbon}
      {imageLoading && <Skeleton variant="rectangular" animation="wave" sx={{ height: '100%' }} />}
      {!dataLoading && (
        <>
          <TopNotices>
            <PageNotice journeyTypeName={journeyTypeName} />
          </TopNotices>
          <Box>
            <ImageBlurredSides
              src={bannerUrl}
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
            </PageTitle>
            <Tagline noWrap ref={element => addAutomaticTooltip(element)}>
              {tagline}
            </Tagline>
          </Title>
        </>
      )}
    </Root>
  );
};

export default SpacePageBanner;
