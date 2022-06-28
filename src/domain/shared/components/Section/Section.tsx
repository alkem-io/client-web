import { Box, Paper, PaperProps, Skeleton } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { FC, useState } from 'react';
import SectionSpacer from './SectionSpacer';

const useNormalStyles = makeStyles(theme => ({
  bannerContainer: {
    height: theme.spacing(12),
    background: theme.palette.neutralMedium.light,
  },
  bannerImage: {
    height: theme.spacing(12),
    objectFit: 'cover',
    width: '100%',
  },
  section: {
    padding: theme.spacing(2),
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  container: {},
}));

const useSideBannerStyles = makeStyles(theme => ({
  bannerContainer: {
    flex: 1,
    objectFit: 'cover',
    background: theme.palette.neutralMedium.light,
    overflow: 'hidden',
  },
  bannerImage: {
    height: '100%',
  },
  section: {
    padding: theme.spacing(2),
    flex: 3,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
  },
}));

export interface SectionProps {
  bannerUrl?: string;
  alwaysShowBanner?: boolean;
  bannerOverlay?: React.ReactNode;
  classes?: {
    section?: PaperProps['classes'];
  };
  sideBanner?: boolean;
  sideBannerRight?: boolean;
}

const Section: FC<SectionProps> = ({
  bannerUrl,
  alwaysShowBanner,
  bannerOverlay,
  classes,
  children,
  sideBanner = false,
  sideBannerRight = false,
}) => {
  const normalStyles = useNormalStyles();
  const sideBannerStyles = useSideBannerStyles();
  const styles = sideBanner ? sideBannerStyles : normalStyles;

  // state
  const [bannerLoading, setBannerLoading] = useState<boolean>(true);

  return (
    <>
      <Paper elevation={0} square variant="outlined" classes={classes?.section} className={styles.container}>
        {bannerUrl ? (
          <Box position="relative" className={styles.bannerContainer} sx={sideBannerRight ? { order: 2 } : null}>
            <img src={bannerUrl} alt="banner" onLoad={() => setBannerLoading(false)} className={styles.bannerImage} />
            <div className={styles.overlay}>{bannerOverlay}</div>
            {bannerLoading && (
              <Paper square sx={{ position: 'absolute', inset: 0 }}>
                <Skeleton variant="rectangular" animation="wave" sx={{ height: '100%' }} />
              </Paper>
            )}
          </Box>
        ) : (
          <>
            {alwaysShowBanner && (
              <Box position="relative" className={styles.bannerContainer}>
                {bannerOverlay}
              </Box>
            )}
          </>
        )}
        <Box className={styles.section}>{children}</Box>
      </Paper>
    </>
  );
};

export { SectionSpacer };

export default Section;
