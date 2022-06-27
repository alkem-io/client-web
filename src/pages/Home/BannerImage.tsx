import { Box, Paper, Skeleton } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useState } from 'react';

const useStyles = makeStyles(theme => ({
  bannerSize: {
    background: theme.palette.neutralMedium.light,
    display: 'block',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
}));

const BannerImage = () => {
  const bannerUrl = './alkemio-banner/alkemio-banner-{size}.png';
  // https://mui.com/system/display/
  const sizes = {
    xs: { display: { xs: 'block', sm: 'none' }, marginTop: 8 },
    sm: { display: { xs: 'none', sm: 'block', md: 'none' } },
    md: { display: { xs: 'none', md: 'block', lg: 'none' }, marginTop: 2 },
    lg: { display: { xs: 'none', lg: 'block', xl: 'none' } },
    xl: { display: { xs: 'none', xl: 'block' } },
  };

  const [bannerLoading, setBannerLoading] = useState<boolean>(true);

  const styles = useStyles();

  return (
    <Box position="relative" className={styles.bannerSize}>
      {Object.keys(sizes).map(size => (
        <Box sx={sizes[size]}>
          <img
            src={bannerUrl.replace('{size}', size)}
            alt="banner"
            onLoad={() => setBannerLoading(false)}
            className={styles.bannerSize}
            style={{ width: '100%' }}
          />
        </Box>
      ))}
      <div className={styles.overlay}></div>
      {bannerLoading && (
        <Paper square sx={{ position: 'absolute', inset: 0 }}>
          <Skeleton variant="rectangular" animation="wave" sx={{ height: '100%' }} />
        </Paper>
      )}
    </Box>
  );
};

export default BannerImage;
