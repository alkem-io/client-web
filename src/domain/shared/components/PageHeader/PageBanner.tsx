import { Box, Skeleton, styled, Typography } from '@mui/material';
import { FC } from 'react';
import hexToRGBA from '../../../../utils/hexToRGBA';
import Breadcrumbs from './Breadcrumbs';

export const BANNER_ASPECT_RATIO = '6/1'; // Original banner images were 768 x 128 pixels
export const DEFAULT_BANNER_URL = '/alkemio-banner/default-banner.png'; // Original banner images were 768 x 128 pixels

const Root = styled(Box)(({ theme }) => ({
  aspectRatio: BANNER_ASPECT_RATIO,
  backgroundColor: theme.palette.grey[100],
  position: 'relative',
}));

const Title = styled(Box)(({ theme }) => ({
  backgroundColor: hexToRGBA(theme.palette.common.black, 0.5),
  color: theme.palette.common.white,
  position: 'absolute',
  width: '100%',
  bottom: 0,
  textAlign: 'center',
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(0.5),
  [theme.breakpoints.only('xs')]: {
    height: '100%',
  },
  '& h1': {
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },
  '& .MuiTypography-caption': {
    fontStyle: 'italic ',
  },
  '& .MuiBreadcrumbs-root, & .MuiLink-root, & .MuiTypography-button': {
    color: theme.palette.common.white,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: 'bold',
  },
}));

const Image = styled('img')(() => ({
  position: 'absolute',
  top: 0,
  width: '100%',
  height: '100%',
}));

export interface PageBannerProps {
  title?: string;
  tagline?: string;
  bannerUrl?: string;
  showBreadcrumbs?: boolean;
  breadcrumbsTitle?: string;
  loading: boolean;
}

const PageBanner: FC<PageBannerProps> = ({ title, tagline, bannerUrl, showBreadcrumbs, breadcrumbsTitle, loading }) => {
  bannerUrl = bannerUrl || DEFAULT_BANNER_URL;

  return (
    <Root>
      <Skeleton variant="rectangular" animation="wave" sx={{ height: '100%' }} />
      {!loading && (
        <>
          <Image src={bannerUrl} alt={`${title} - Banner image`} />
          <Title>
            {showBreadcrumbs && <Breadcrumbs title={breadcrumbsTitle} />}
            <Typography variant={'h1'}>{title}</Typography>
            <Typography variant={'caption'}>{tagline}</Typography>
          </Title>
        </>
      )}
    </Root>
  );
};

export default PageBanner;
