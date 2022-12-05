import React from 'react';
import { Box, Container, Link, Paper } from '@mui/material';
import { makeStyles } from '@mui/styles';
import WrapperToolbar from '../../../core/WrapperToolbar';
import WrapperTypography from '../../../core/WrapperTypography';
import Image from '../../../../../domain/shared/components/Image';
import { useConfig } from '../../../../../domain/platform/config/useConfig';
import { RouterLink } from '../../../core/RouterLink';
import useCurrentBreakpoint from '../../../../../core/ui/utils/useCurrentBreakpoint';
import { useTranslation } from 'react-i18next';

const useFooterStyles = makeStyles(theme => ({
  footer: {
    marginTop: theme.spacing(2),
    width: '100%',
  },
  logo: {
    height: theme.spacing(2),
  },
  footerSecondary: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));

const Footer = () => {
  const { t } = useTranslation();
  const styles = useFooterStyles();
  const { platform } = useConfig();
  const breakpoint = useCurrentBreakpoint();

  return (
    <Paper elevation={2} sx={{ marginTop: 4 }}>
      <Container maxWidth={breakpoint} sx={{ marginTop: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box justifyContent="center" textAlign="center" display={{ xs: 'block', sm: 'none' }} my={1}>
          <Link component={RouterLink} to="/about">
            <Image src="/logo.png" alt="Alkemio" className={styles.logo} />
          </Link>
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
          <Box display={{ xs: 'none', sm: 'block' }} component={RouterLink} to="/about">
            <Image src="/logo.png" alt="Alkemio" className={styles.logo} />
          </Box>
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
          <WrapperTypography variant="caption" color="neutralMedium" weight="boldLight">
            {t('footer.copyright')}
          </WrapperTypography>
        </WrapperToolbar>
      </Container>
    </Paper>
  );
};

export default Footer;
