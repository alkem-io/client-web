import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TranslateWithElements } from '../../domain/shared/i18n/TranslateWithElements';
import BannerImage from './BannerImage';
import HeaderLink from './HeaderLink';
import { useConfig } from '../../hooks';

const WelcomeSection = () => {
  const { t } = useTranslation();

  const tLinks = TranslateWithElements(<HeaderLink target="_blank" />);
  const theme = useTheme();
  const { platform } = useConfig();

  return (
    <>
      <BannerImage />
      <Typography
        variant="h1"
        textAlign="center"
        fontSize={theme.typography.h6.fontSize}
        fontWeight="bold"
        lineHeight={theme.spacing(4)}
        sx={{
          marginTop: theme.spacing(2),
          [theme.breakpoints.only('lg')]: {
            marginLeft: '4em',
            marginRight: '4em',
          },
        }}
      >
        {t('pages.home.sections.welcome.head')}
      </Typography>
      <Box
        sx={{
          textAlign: 'center',
          lineHeight: theme.spacing(2),
          marginTop: theme.spacing(1),
          marginBottom: theme.spacing(1),
        }}
      >
        {tLinks('pages.home.sections.welcome.impact', {
          impact: { href: platform?.impact },
        })}
        {tLinks('pages.home.sections.welcome.foundation', {
          foundation: { href: platform?.foundation },
        })}
        {tLinks('pages.home.sections.welcome.opensource', {
          opensource: { href: platform?.opensource },
        })}
      </Box>
    </>
  );
};

export default WelcomeSection;
