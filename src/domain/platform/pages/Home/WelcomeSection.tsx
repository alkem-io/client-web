import React from 'react';
import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TranslateWithElements } from '../../../shared/i18n/TranslateWithElements';
import BannerImage from './BannerImage';
import { useConfig } from '../../config/useConfig';
import { PageTitle } from '../../../../core/ui/typography';
import { gutters } from '../../../../core/ui/grid/utils';

const Separator = () => <Box lineHeight={gutters()}> • </Box>;

const WelcomeSection = () => {
  const { t } = useTranslation();

  const tLinks = TranslateWithElements(<Button component="a" target="_blank" />);

  const { platform } = useConfig();

  return (
    <>
      <BannerImage />
      <PageTitle textAlign="center" paddingY={1} paddingX={2}>
        {t('pages.home.sections.welcome.head')}
      </PageTitle>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={gutters(2)}
        sx={{
          textAlign: 'center',
        }}
      >
        {tLinks('pages.home.sections.welcome.impact', {
          impact: { href: platform?.impact },
        })}
        <Separator />
        {tLinks('pages.home.sections.welcome.opensource', {
          opensource: { href: platform?.opensource },
        })}
        <Separator />
        {tLinks('pages.home.sections.welcome.foundation', {
          foundation: { href: platform?.foundation },
        })}
      </Box>
    </>
  );
};

export default WelcomeSection;
