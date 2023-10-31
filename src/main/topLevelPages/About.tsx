import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@mui/material';
import Grid from '@mui/material/Grid';
import { makeStyles } from '@mui/styles';
import WrapperTypography from '../../core/ui/typography/deprecated/WrapperTypography';
import useVersionControl from '../../domain/platform/metadata/useVersionControl';
import useServerMetadata from '../../domain/platform/metadata/useServerMetadata';
import TopLevelLayout from '../ui/layout/TopLevelLayout';
import HelpDialog from '../../core/help/dialog/HelpDialog';

const useAboutStyles = makeStyles(theme => ({
  content: {
    padding: theme.spacing(4),
    [theme.breakpoints.down('xl')]: {
      padding: theme.spacing(2),
    },
  },
  logo: {
    height: theme.spacing(7),
  },
  mdHidden: {
    [theme.breakpoints.down('xl')]: {
      display: 'none',
      visibility: 'hidden',
      padding: 0,
    },
  },
  link: {
    '&:hover': {
      textDecoration: 'none',
    },
  },
  ring: {
    width: 3560,
    height: 3560,
    borderRadius: '50%',
    border: `1px solid ${theme.palette.primary.main}`,
    position: 'absolute',
    transform: 'translate3d(-50%, 5%, 0)',
    left: '50%',
    [theme.breakpoints.down('xl')]: {
      width: 1500,
      height: 1500,
      transform: 'translate3d(-50%, 10%, 0)',
    },
  },
  version: {
    display: 'flex',
  },
}));

export const AboutPage = () => {
  const styles = useAboutStyles();
  const { currentClientVersion } = useVersionControl();
  const { services } = useServerMetadata();
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);

  const openHelpDialog = () => {
    setDialogOpen(true);
  };

  return (
    <TopLevelLayout>
      <Grid container spacing={2}>
        <Grid item lg={3} className={styles.mdHidden} />
        <Grid item xs={12} lg={6}>
          <div className={styles.content}>
            <div className={styles.version}>
              <img src="/logo.png" className={styles.logo} alt="Alkemio" />
              <WrapperTypography color={'neutralMedium'}>v{currentClientVersion}</WrapperTypography>
            </div>
            {services.length >= 1 && (
              <Box marginBottom={4}>
                <WrapperTypography color={'neutralMedium'}>
                  {t('pages.about.powered-by', {
                    name: services[0].name,
                    version: services[0].version,
                  })}
                </WrapperTypography>
              </Box>
            )}

            <Box marginBottom={4}>
              <WrapperTypography variant={'h3'} color={'neutralMedium'}>
                {t('pages.about.title')}
              </WrapperTypography>
            </Box>
            <Box marginBottom={4}>
              <WrapperTypography>{t('pages.about.description')}</WrapperTypography>
            </Box>
            <Button variant="outlined" onClick={openHelpDialog}>
              {t('buttons.learn-more')}
            </Button>
          </div>
        </Grid>
        <Grid item lg={3} className={styles.mdHidden} />
      </Grid>
      <HelpDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </TopLevelLayout>
  );
};

export default AboutPage;
