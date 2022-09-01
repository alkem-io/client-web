import { Box, Skeleton, styled, Typography } from '@mui/material';
import { FC, useState } from 'react';
import hexToRGBA from '../../../../common/utils/hexToRGBA';
import useAutomaticTooltip from '../../utils/useAutomaticTooltip';
import BreadcrumbsView from './BreadcrumbsView';

export const BANNER_ASPECT_RATIO = '6/1'; // Original banner images were 768 x 128 pixels
export const DEFAULT_BANNER_URL = '/alkemio-banner/default-banner.png'; // Original banner images were 768 x 128 pixels
export const TITLE_HEIGHT = 7;

const Root = styled(Box)(({ theme }) => ({
  aspectRatio: BANNER_ASPECT_RATIO,
  backgroundColor: theme.palette.grey[100],
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
    position: 'relative',
    backgroundColor: '#004f54',
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

const ImageWrapper = styled('div')(() => ({
  position: 'absolute',
  top: 0,
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  zIndex: 10,
}));

const Image = styled('img')(() => ({
  objectFit: 'cover',
  objectPosition: '50% 50%',
  width: '100%',
  height: '100%',
}));

export interface PageBannerProps {
  title?: string;
  tagline?: string;
  bannerUrl?: string;
  showBreadcrumbs?: boolean;
  loading?: boolean;
}

const PageBanner: FC<PageBannerProps> = ({
  title,
  tagline,
  bannerUrl,
  showBreadcrumbs,
  loading: dataLoading = false,
}) => {
  const { containerReference, addAutomaticTooltip } = useAutomaticTooltip();
  bannerUrl = bannerUrl || DEFAULT_BANNER_URL;

  const [imageLoading, setImageLoading] = useState(true);

  const imageLoadError = () => {
    setImageLoading(false);
  };

  return (
    <Root ref={containerReference}>
      {imageLoading && <Skeleton variant="rectangular" animation="wave" sx={{ height: '100%' }} />}
      {!dataLoading && (
        <>
          {showBreadcrumbs && <BreadcrumbsView />}
          <ImageWrapper>
            <Image
              src={bannerUrl}
              alt={`${title} - Banner image`}
              onLoad={() => setImageLoading(false)}
              onError={imageLoadError}
            />
          </ImageWrapper>
          <Title>
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
    </Root>
  );
};

export default PageBanner;
