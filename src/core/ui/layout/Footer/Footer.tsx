import React from 'react';
import { Box, Container, Link, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import WrapperToolbar from '../../../../common/components/core/WrapperToolbar';
import { Caption } from '../../typography';
import { useConfig } from '../../../../domain/platform/config/useConfig';
import useCurrentBreakpoint from '../../utils/useCurrentBreakpoint';
import FooterLogo from './FooterLogo';

const Footer = () => {
  const { t } = useTranslation();
  const { platform } = useConfig();
  const breakpoint = useCurrentBreakpoint();

  return (
    <Paper elevation={2}>
      <Container maxWidth={breakpoint} sx={{ marginTop: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box justifyContent="center" textAlign="center" display={{ xs: 'block', sm: 'none' }} my={1}>
          <FooterLogo />
        </Box>
        <Box
          display="flex"
          justifyContent="center"
          gap={2}
          rowGap={1}
          flexWrap={{ xs: 'wrap', md: 'nowrap' }}
          flexGrow={1}
        >
          <Link href={platform?.terms || ''} target="_blank" rel="noopener noreferrer">
            {t('footer.terms')}
          </Link>
          <Link href={platform?.privacy || ''} target="_blank" rel="noopener noreferrer">
            {t('footer.privacy')}
          </Link>
          <Link href={platform?.security || ''} target="_blank" rel="noopener noreferrer">
            {t('footer.security')}
          </Link>
          <FooterLogo display={{ xs: 'none', sm: 'block' }} />
          <Link href={platform?.feedback || ''} target="_blank" rel="noopener noreferrer">
            {t('footer.feedback')}
          </Link>
          <Link href={platform?.support || ''} target="_blank" rel="noopener noreferrer">
            {t('footer.support')}
          </Link>
          <Link href={platform?.about || ''} target="_blank" rel="noopener noreferrer">
            {t('footer.about')}
          </Link>
        </Box>
        <WrapperToolbar dense sx={{ marginTop: { md: 2 } }}>
          <Caption>{t('footer.copyright')}</Caption>
        </WrapperToolbar>
      </Container>
    </Paper>
  );
};

export default Footer;
