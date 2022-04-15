import { Box, Paper, PaperProps, Skeleton } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { FC, useState } from 'react';

const useStyles = makeStyles(theme => ({
  bannerSize: {
    height: theme.spacing(12),
    objectFit: 'cover',
    background: theme.palette.neutralMedium.light,
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
}));

export interface SectionProps {
  bannerUrl?: string;
  alwaysShowBanner?: boolean;
  bannerOverlay?: React.ReactNode;
  classes?: {
    section?: PaperProps['classes'];
  };
}

const Section: FC<SectionProps> = ({ bannerUrl, alwaysShowBanner, bannerOverlay, classes, children }) => {
  const styles = useStyles();

  // state
  const [bannerLoading, setBannerLoading] = useState<boolean>(true);

  return (
    <>
      <Paper elevation={0} square variant="outlined" classes={classes?.section}>
        {bannerUrl ? (
          <Box position="relative" className={styles.bannerSize}>
            <img
              src={bannerUrl}
              alt="banner"
              onLoad={() => setBannerLoading(false)}
              className={styles.bannerSize}
              style={{ width: '100%' }}
            />
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
              <Box position="relative" className={styles.bannerSize}>
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

export const SectionSpacer: FC<{ double?: boolean }> = ({ double }) => <Box padding={double ? 2 : 1} />;

export default Section;
