import React, { useState } from 'react';
import { Box, Container, Link, LinkProps, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import WrapperToolbar from '../../../../common/components/core/WrapperToolbar';
import { Caption } from '../../typography';
import { useConfig } from '../../../../domain/platform/config/useConfig';
import useCurrentBreakpoint from '../../utils/useCurrentBreakpoint';
import FooterLogo from './FooterLogo';
import LanguageSelect from '../../../../common/components/composite/layout/TopBar/LanguageSelect';
import HelpDialog from '../../../help/dialog/HelpDialog';
import { gutters } from '../../grid/utils';

const FooterLink = (props: LinkProps) => {
  return <Caption component={Link} {...props} />;
};

const Footer = () => {
  const { t } = useTranslation();
  const { platform } = useConfig();
  const breakpoint = useCurrentBreakpoint();

  const [dialogOpen, setDialogOpen] = useState(false);

  const openHelpDialog = () => {
    setDialogOpen(true);
  };

  return (
    <Paper elevation={2} square>
      <Container maxWidth={breakpoint} sx={{ marginTop: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box justifyContent="center" textAlign="center" display={{ xs: 'block', sm: 'none' }} my={1}>
          <FooterLogo />
        </Box>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          gap={gutters()}
          rowGap={1}
          flexWrap={{ xs: 'wrap', md: 'nowrap' }}
          flexGrow={1}
        >
          <FooterLink href={platform?.terms || ''}>{t('footer.terms')}</FooterLink>
          <FooterLink href={platform?.privacy || ''}>{t('footer.privacy')}</FooterLink>
          <FooterLink href={platform?.security || ''}>{t('footer.security')}</FooterLink>
          <FooterLogo display={{ xs: 'none', sm: 'block' }} />
          <FooterLink onClick={openHelpDialog} sx={{ cursor: 'pointer' }}>
            {t('footer.support')}
          </FooterLink>
          <FooterLink href={platform?.about || ''}>{t('footer.about')}</FooterLink>
          <Box height={gutters()} display="flex" alignItems="center">
            <LanguageSelect />
          </Box>
        </Box>
        <WrapperToolbar dense>
          <Caption>{t('footer.copyright')}</Caption>
        </WrapperToolbar>
      </Container>
      <HelpDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Paper>
  );
};

export default Footer;
