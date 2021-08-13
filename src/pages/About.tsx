import React from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '../components/core/Button';
import Typography from '../components/core/Typography';
import { createStyles } from '../hooks/useTheme';
import { useServerMetadataQuery } from '../hooks/generated/graphql';
import { useTranslation } from 'react-i18next';
import { Box } from '@material-ui/core';

const useAboutStyles = createStyles(theme => ({
  content: {
    padding: `${theme.spacing(4)}px`,
    [theme.breakpoints.down('md')]: {
      padding: `${theme.spacing(2)}px`,
    },
  },
  logo: {
    height: theme.spacing(7),
  },
  mdHidden: {
    [theme.breakpoints.down('lg')]: {
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
    [theme.breakpoints.down('md')]: {
      width: 1500,
      height: 1500,
      transform: 'translate3d(-50%, 10%, 0)',
    },
  },
  version: {
    display: 'flex',
  },
}));

const AboutPage = () => {
  const styles = useAboutStyles();
  const { data } = useServerMetadataQuery();
  const { t } = useTranslation();
  return (
    <>
      <Grid container spacing={2}>
        <Grid item lg={3} className={styles.mdHidden} />
        <Grid item xs={12} lg={6}>
          <div className={styles.content}>
            <div className={styles.version}>
              <img src="/logo.png" className={styles.logo} alt="Alkemio" />
              <Typography color={'neutralMedium'}>v{process.env.REACT_APP_VERSION}</Typography>
            </div>
            {data && (
              <Box marginBottom={4}>
                <Typography color={'neutralMedium'}>
                  {t('pages.about.powered-by', {
                    name: data?.metadata.services[0].name,
                    version: data?.metadata.services[0].version,
                  })}
                </Typography>
              </Box>
            )}

            <Box marginBottom={4}>
              <Typography variant={'h3'} color={'neutralMedium'}>
                {t('pages.about.title')}
              </Typography>
            </Box>
            <Box marginBottom={4}>
              <Typography>{t('pages.about.description')}</Typography>
            </Box>
            <a href="https://alkem.io/about/" target="_blank" rel="noopener noreferrer" className={styles.link}>
              <Button text={t('buttons.learn-more')} />
            </a>
          </div>
        </Grid>
        <Grid item lg={3} className={styles.mdHidden} />
      </Grid>
      <div className={styles.ring} />
    </>
  );
};

export default AboutPage;
