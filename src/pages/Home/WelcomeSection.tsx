import React from 'react';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useTranslation } from 'react-i18next';
import Typography from '../../components/core/Typography';
import { TranslateWithElements } from '../../domain/shared/i18n/TranslateWithElements';
import BannerImage from './BannerImage';
import HeaderLink from './HeaderLink';

const useStyles = makeStyles(theme => ({
  bannerSize: {
    height: theme.spacing(12),
    objectFit: 'cover',
    background: theme.palette.neutralMedium.light,
  },
  headerText: {
    textAlign: 'center',
    fontSize: theme.typography.h6.fontSize,
    lineHeight: theme.spacing(4),
    marginTop: theme.spacing(2),
  },
  headerLinks: {
    textAlign: 'center',
    fontSize: theme.typography.h6.fontSize,
    lineHeight: theme.spacing(4),
    marginTop: theme.spacing(2),
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

const WelcomeSection = () => {
  const { t } = useTranslation();
  const styles = useStyles();

  const tLinks = TranslateWithElements(<HeaderLink />);

  return (
    <>
      <BannerImage />
      <Typography variant="h1" className={styles.headerText} weight="bold">
        {t('pages.home.sections.welcome.head')}
      </Typography>
      <Box className={styles.headerLinks}>
        {tLinks('pages.home.sections.welcome.impact', {
          impact: { href: t('pages.home.sections.welcome.impact-url') },
        })}
        {tLinks('pages.home.sections.welcome.foundation', {
          foundation: { href: t('pages.home.sections.welcome.foundation-url') },
        })}
        {tLinks('pages.home.sections.welcome.opensource', {
          opensource: { href: t('pages.home.sections.welcome.opensource-url') },
        })}
      </Box>
      <Box></Box>
    </>
  );
};

export default WelcomeSection;
