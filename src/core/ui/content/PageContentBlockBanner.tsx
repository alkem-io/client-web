import { Box, Paper, Skeleton, styled } from '@mui/material';
import { gutters } from '../grid/utils';
import Image from '@/core/ui/image/Image';
import { useState } from 'react';

const BannerContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: theme.spacing(12),
  background: theme.palette.neutralMedium.light,
  margin: gutters(-1)(theme),
}));
type PageContentBlockBannerProps = {
  bannerUrl?: string;
  children: React.ReactNode;
};
const PageContentBlockBanner = ({ bannerUrl, children }: PageContentBlockBannerProps) => {
  const [bannerLoading, setBannerLoading] = useState(!!bannerUrl);
  return (
    <BannerContainer>
      {bannerUrl && (
        <>
          <Image
            src={bannerUrl}
            alt="Section banner"
            onLoad={() => setBannerLoading(false)}
            sx={theme => ({
              height: theme.spacing(12),
              objectFit: 'cover',
              width: '100%',
            })}
          />
          {bannerLoading && (
            <Paper square sx={{ position: 'absolute', inset: 0 }}>
              <Skeleton variant="rectangular" animation="wave" sx={{ height: '100%' }} />
            </Paper>
          )}
        </>
      )}
      <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}>
        <Box sx={{ p: 2 }}>{children}</Box>
      </Box>
    </BannerContainer>
  );
};

export default PageContentBlockBanner;
