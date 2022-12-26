import { Box, Skeleton, styled, useTheme } from '@mui/material';
import { FC, ReactNode, useState } from 'react';
import hexToRGBA from '../../../../common/utils/hexToRGBA';
import useAutomaticTooltip from '../../utils/useAutomaticTooltip';
import BreadcrumbsView from './BreadcrumbsView';
import { EntityTypeName } from '../../layout/LegacyPageLayout/SimplePageLayout';
import getEntityColor from '../../utils/getEntityColor';
import { PageTitle, Tagline } from '../../../../core/ui/typography';
import ImageBlurredSides from '../../../../core/ui/image/ImageBlurredSides';
import { MAX_CONTENT_WIDTH_GUTTERS } from '../../../../core/ui/grid/constants';
import { gutters } from '../../../../core/ui/grid/utils';

export const DEFAULT_BANNER_URL = '/alkemio-banner/alkemio-banner-xl.png';
export const TITLE_HEIGHT = 6;

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

const PageNotice = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  width: '100%',
  zIndex: 30,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '& a': {
    color: theme.palette.primary.contrastText,
  },
  textAlign: 'center',
  padding: theme.spacing(0.5, 0),
}));

export interface EntityPageBannerProps {
  title?: string;
  tagline?: string;
  bannerUrl?: string;
  showBreadcrumbs?: boolean;
  loading?: boolean;
  pageNotice?: ReactNode;
  entityTypeName: EntityTypeName | 'admin';
}

/**
 * This is the common top banner for Hubs/Challenges/Opportunities, and in general anything else except the home.
 * For Users/Organizations see ProfileBanner
 */
const EntityPageBanner: FC<EntityPageBannerProps> = ({
  title,
  tagline,
  bannerUrl,
  showBreadcrumbs,
  entityTypeName,
  pageNotice = undefined,
  loading: dataLoading = false,
}) => {
  const { containerReference, addAutomaticTooltip } = useAutomaticTooltip();
  bannerUrl = bannerUrl || DEFAULT_BANNER_URL;

  const [imageLoading, setImageLoading] = useState(true);

  const imageLoadError = () => {
    setImageLoading(false);
  };

  const theme = useTheme();

  const titleBackgroundColor = getEntityColor(theme, entityTypeName);
  // const titleForegroundColor = entityTypeName === 'opportunity' ? theme.palette.hub.main : theme.palette.common.white;

  return (
    <Root ref={containerReference}>
      {imageLoading && <Skeleton variant="rectangular" animation="wave" sx={{ height: '100%' }} />}
      {!dataLoading && (
        <>
          {pageNotice ? <PageNotice>{pageNotice}</PageNotice> : undefined}
          {showBreadcrumbs && <BreadcrumbsView />}
          <ImageBlurredSides
            src={bannerUrl}
            alt={`${title} - Banner image`}
            onLoad={() => setImageLoading(false)}
            onError={imageLoadError}
            blurRadius={2}
            height={theme => theme.spacing(18)}
            width={gutters(MAX_CONTENT_WIDTH_GUTTERS - 2)}
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

export default EntityPageBanner;
