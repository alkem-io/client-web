import React from 'react';
import { Col } from 'react-bootstrap';
import Button from '../components/core/Button';
import Typography from '../components/core/Typography';
import { createStyles } from '../hooks/useTheme';
import { useServerMetadataQuery } from '../components/generated/graphql';
import { useTranslation } from 'react-i18next';

const useAboutStyles = createStyles(theme => ({
  row: {
    display: 'flex',
  },
  content: {
    padding: `${theme.shape.spacing(4)}px`,
    [theme.media.down('md')]: {
      padding: `${theme.shape.spacing(2)}px`,
    },
  },
  logo: {
    height: theme.shape.spacing(7),
  },
  mdHidden: {
    [theme.media.down('lg')]: {
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
    border: `1px solid ${theme.palette.primary}`,
    position: 'absolute',
    transform: 'translate3d(-50%, 5%, 0)',
    left: '50%',
    [theme.media.down('md')]: {
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
      <div className={styles.row}>
        <Col lg={3} className={styles.mdHidden} />
        <Col xs={12} lg={6}>
          <div className={styles.content}>
            <div className={styles.version}>
              <img src="/logo.png" className={styles.logo} alt="Alkemio" />
              <Typography color={'neutralMedium'}>v{process.env.REACT_APP_VERSION}</Typography>
            </div>
            {data && (
              <Typography color={'neutralMedium'} className={'mb-4'}>
                {t('pages.about.powered-by', {
                  name: data?.metadata.services[0].name,
                  version: data?.metadata.services[0].version,
                })}
              </Typography>
            )}

            <Typography variant={'h3'} color={'neutralMedium'} className={'mb-4'}>
              {t('pages.about.title')}
            </Typography>
            <Typography className={'mb-4'}>{t('pages.about.description')}</Typography>
            <a href="https://alkem.io/about/" target="_blank" rel="noopener noreferrer" className={styles.link}>
              <Button>{t('buttons.learn-more')}</Button>
            </a>
          </div>
        </Col>
        <Col lg={3} className={styles.mdHidden} />
      </div>
      <div className={styles.ring} />
    </>
  );
};

export default AboutPage;
