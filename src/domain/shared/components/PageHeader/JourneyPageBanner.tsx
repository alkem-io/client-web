import { Box, Link, Skeleton, styled, useTheme } from '@mui/material';
import { FC, ReactNode, useState } from 'react';
import hexToRGBA from '../../../../common/utils/hexToRGBA';
import useAutomaticTooltip from '../../utils/useAutomaticTooltip';
import BreadcrumbsView from './BreadcrumbsView';
import { JourneyTypeName } from '../../../challenge/JourneyTypeName';
import getEntityColor from '../../utils/getEntityColor';
import { Caption, PageTitle, Tagline } from '../../../../core/ui/typography';
import ImageBlurredSides from '../../../../core/ui/image/ImageBlurredSides';
import { MAX_CONTENT_WIDTH_GUTTERS } from '../../../../core/ui/grid/constants';
import { gutters } from '../../../../core/ui/grid/utils';
import { HubVisibility } from '../../../../core/apollo/generated/graphql-schema';
import { useHub } from '../../../challenge/hub/HubContext/useHub';
import { useConfig } from '../../../platform/config/useConfig';
import { TranslateWithElements } from '../../i18n/TranslateWithElements';
import { BoxProps } from '@mui/system';
import { useTranslation } from 'react-i18next';
import { env } from '../../../../types/env';

export const DEFAULT_BANNER_URL = '/alkemio-banner/alkemio-banner-xl.png';
export const TITLE_HEIGHT = 6;

const ALKEMIO_DOMAIN = env?.REACT_APP_ALKEMIO_DOMAIN ?? '/';

const Root = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.neutralLight.main,
  position: 'relative',
  [theme.breakpoints.down('lg')]: {
    // On small screens title goes under the banner image
    marginBottom: theme.spacing(TITLE_HEIGHT),
  },
}));

const Title = styled(Box)(({ theme }) => ({
  backgroundColor: hexToRGBA(theme.palette.common.black, 0.5),
  color: theme.palette.common.white,
  position: 'absolute',
  width: '100%',
  bottom: 0,
  textAlign: 'center',
  zIndex: 20,
  display: 'flex',
  flexDirection: 'column',
  height: theme.spacing(TITLE_HEIGHT),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  justifyContent: 'space-evenly',
  [theme.breakpoints.down('lg')]: {
    bottom: theme.spacing(-TITLE_HEIGHT),
  },
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
  const { visibility: hubVisibility } = useHub();

  if (hubVisibility === HubVisibility.Active) return null;
  if (journeyTypeName === 'admin') return null;

  let message: ReactNode = undefined;

  switch (journeyTypeName) {
    case 'hub': {
      if (hubVisibility === HubVisibility.Archived) {
        message = tLinks('pages.generic.archived-notice.archived-hub', {
          contact: { href: platform?.feedback, target: '_blank' },
        });
      }
      if (hubVisibility === HubVisibility.Demo) {
        message = tLinks('pages.generic.demo-notice.demo-hub', {
          alkemio: { href: ALKEMIO_DOMAIN, target: '_blank' },
        });
      }
      break;
    }
    default: {
      if (hubVisibility === HubVisibility.Archived) {
        message = tLinks(
          'pages.generic.archived-notice.archived-journey',
          {
            contact: { href: platform?.feedback, target: '_blank' },
          },
          { journey: t(`common.${journeyTypeName}` as const) }
        );
      }
      if (hubVisibility === HubVisibility.Demo) {
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

export interface JourneyPageBannerProps {
  title?: string;
  tagline?: string;
  bannerUrl?: string;
  bannerAltText?: string;
  showBreadcrumbs?: boolean;
  ribbon?: ReactNode;
  loading?: boolean;
  journeyTypeName: JourneyTypeName | 'admin';
}

/**
 * This is the common top banner for Hubs/Challenges/Opportunities, and in general anything else except the home.
 * For Users/Organizations see ProfileBanner
 */
const JourneyPageBanner: FC<JourneyPageBannerProps> = ({
  title,
  tagline,
  bannerUrl,
  bannerAltText,
  showBreadcrumbs,
  ribbon,
  journeyTypeName,
  loading: dataLoading = false,
}) => {
  const { t } = useTranslation();
  const { containerReference, addAutomaticTooltip } = useAutomaticTooltip();
  bannerUrl = bannerUrl || DEFAULT_BANNER_URL;

  const [imageLoading, setImageLoading] = useState(true);

  const imageLoadError = () => {
    setImageLoading(false);
  };

  const theme = useTheme();

  const titleBackgroundColor = getEntityColor(theme, journeyTypeName);

  return (
    <Root ref={containerReference}>
      {ribbon}
      {imageLoading && <Skeleton variant="rectangular" animation="wave" sx={{ height: '100%' }} />}
      {!dataLoading && (
        <>
          <TopNotices>
            {<PageNotice journeyTypeName={journeyTypeName} />}
            {showBreadcrumbs && <BreadcrumbsView />}
          </TopNotices>
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
          <Title
            sx={{
              [theme.breakpoints.down('lg')]: {
                backgroundColor: titleBackgroundColor /*, color: titleForegroundColor*/,
              },
            }}
          >
            <PageTitle noWrap ref={element => addAutomaticTooltip(element)}>
              {title}
            </PageTitle>
            <Tagline noWrap ref={element => addAutomaticTooltip(element)}>
              {tagline}
            </Tagline>
          </Title>
        </>
      )}
      {dataLoading && <Skeleton variant="rectangular" />}
    </Root>
  );
};

export default JourneyPageBanner;
