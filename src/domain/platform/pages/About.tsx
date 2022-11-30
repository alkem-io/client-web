import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import { makeStyles } from '@mui/styles';
import WrapperButton from '../../../common/components/core/WrapperButton';
import WrapperTypography from '../../../common/components/core/WrapperTypography';
import { useUpdateNavigation } from '../../../hooks';
import useServerMetadata from '../metadata/useServerMetadata';
import TopLevelDesktopLayout from '../../shared/layout/PageLayout/TopLevelDesktopLayout';

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

const currentPaths = [];
export const AboutPage = () => {
  const styles = useAboutStyles();
  const { services } = useServerMetadata();
  const { t } = useTranslation();

  useUpdateNavigation({ currentPaths });

  return (
    <TopLevelDesktopLayout>
      <Grid container spacing={2}>
        <Grid item lg={3} className={styles.mdHidden} />
        <Grid item xs={12} lg={6}>
          <div className={styles.content}>
            <div className={styles.version}>
              <img src="/logo.png" className={styles.logo} alt="Alkemio" />
              <WrapperTypography color={'neutralMedium'}>v{process.env.REACT_APP_VERSION}</WrapperTypography>
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
            <a href="https://alkem.io/about/" target="_blank" rel="noopener noreferrer" className={styles.link}>
              <WrapperButton text={t('buttons.learn-more')} />
            </a>
          </div>
        </Grid>
        <Grid item lg={3} className={styles.mdHidden} />
      </Grid>
    </TopLevelDesktopLayout>
  );
};

export default AboutPage;
