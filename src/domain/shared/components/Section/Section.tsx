import Image from '@/core/ui/image/Image';
import { Box, Paper, Skeleton, styled } from '@mui/material';
import React, { FC, useState } from 'react';
import SectionSpacer from './SectionSpacer';

const BannerContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: theme.spacing(12),
  background: theme.palette.neutralMedium.light,
}));

export interface SectionProps {
  bannerUrl?: string;
  alwaysShowBanner?: boolean;
  bannerOverlay?: React.ReactNode;
}
/**
 * @deprecated
 * Better use PageContent and PageContentBlock
 */
const Section: FC<SectionProps> = ({ bannerUrl, alwaysShowBanner, bannerOverlay, children }) => {
  const [bannerLoading, setBannerLoading] = useState<boolean>(true);

  return (
    <>
      <Paper elevation={0} variant="outlined">
        {bannerUrl ? (
          <BannerContainer>
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
            <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}>{bannerOverlay}</Box>
            {bannerLoading && (
              <Paper square sx={{ position: 'absolute', inset: 0 }}>
                <Skeleton variant="rectangular" animation="wave" sx={{ height: '100%' }} />
              </Paper>
            )}
          </BannerContainer>
        ) : (
          <>{alwaysShowBanner && <BannerContainer>{bannerOverlay}</BannerContainer>}</>
        )}
        <Box sx={{ p: 2 }}>{children}</Box>
      </Paper>
    </>
  );
};

export { SectionSpacer };

export default Section;
