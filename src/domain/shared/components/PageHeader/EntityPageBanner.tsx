import { Box, Skeleton, styled, Typography, useTheme } from '@mui/material';
import { FC, ReactNode, useState } from 'react';
import hexToRGBA from '../../../../common/utils/hexToRGBA';
import useAutomaticTooltip from '../../utils/useAutomaticTooltip';
import BreadcrumbsView from './BreadcrumbsView';
import { EntityTypeName } from '../../layout/PageLayout/SimplePageLayout';
import getEntityColor from '../../utils/getEntityColor';

export const BANNER_ASPECT_RATIO = '6/1'; // Original banner images were 768 x 128 pixels
export const DEFAULT_BANNER_URL = 'https://sdgs.un.org/themes/custom/porto/assets/goals/global-goals.png'; // Original banner images were 768 x 128 pixels
export const TITLE_HEIGHT = 7;

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
  padding: theme.spacing(1, 2, 0.5, 2),
  height: theme.spacing(TITLE_HEIGHT),
  zIndex: 20,
  [theme.breakpoints.down('lg')]: {
    bottom: theme.spacing(-TITLE_HEIGHT),
  },
  // Title
  '& h1': {
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },
  // Tagline:
  '& .MuiTypography-caption': {
    fontStyle: 'italic',
  },
}));

const Ellipser = styled('div')(() => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  '& > *': {
    display: 'inline',
    whiteSpace: 'nowrap',
  },
}));

const Image = styled('img')(({ theme }) => ({
  display: 'block',
  objectFit: 'cover',
  objectPosition: '50% 50%',
  width: '100%',
  minHeight: theme.spacing(10),
  aspectRatio: BANNER_ASPECT_RATIO,
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
          <Image
            src={bannerUrl}
            alt={`${title} - Banner image`}
            onLoad={() => setImageLoading(false)}
            onError={imageLoadError}
          />
          <Title
            sx={{
              [theme.breakpoints.down('lg')]: {
                backgroundColor: titleBackgroundColor /*, color: titleForegroundColor*/,
              },
            }}
          >
            <Ellipser>
              <Typography variant={'h1'} ref={element => addAutomaticTooltip(element)}>
                {title}
              </Typography>
            </Ellipser>
            <Ellipser>
              <Typography variant={'caption'} ref={element => addAutomaticTooltip(element)}>
                {tagline}
              </Typography>
            </Ellipser>
          </Title>
        </>
      )}
      {dataLoading && <Skeleton variant="rectangular" />}
    </Root>
  );
};

export default EntityPageBanner;
