import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfig } from '@/domain/platform/config/useConfig';
import LanguageSelect from '@/core/ui/language/LanguageSelect';
import HelpDialog from '@/core/help/dialog/HelpDialog';
import FooterLink from '@/core/ui/layout/pageFooter/FooterLink';
import PageFooter from '@/core/ui/layout/pageFooter/PageFooter';
import FooterLogo from './FooterLogo';
import { Caption } from '@/core/ui/typography';
import { BoxProps, Button } from '@mui/material';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';

const PlatformFooter = (props: BoxProps) => {
  const { t } = useTranslation();
  const { locations } = useConfig();

  const [dialogOpen, setDialogOpen] = useState(false);

  const openHelpDialog = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <PageFooter logo={<FooterLogo />} copyright={t('footer.copyright')} {...props}>
        <FooterLink href={locations?.terms}>{t('footer.terms')}</FooterLink>
        <FooterLink href={locations?.privacy}>{t('footer.privacy')}</FooterLink>
        <FooterLink href={locations?.security}>{t('footer.security')}</FooterLink>
        <FooterLink onClick={openHelpDialog} sx={{ cursor: 'pointer' }}>
          {t('footer.support')}
        </FooterLink>
        <FooterLink href={locations?.about}>{t('footer.about')}</FooterLink>
        <LanguageSelect
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          {({ openSelect }) => (
            <Caption
              component={Button}
              startIcon={<LanguageOutlinedIcon />}
              onClick={event => openSelect(event.currentTarget)}
              size="small"
              color="inherit"
              sx={{ textTransform: 'none', display: 'flex' }}
            >
              Language
            </Caption>
          )}
        </LanguageSelect>
      </PageFooter>
      <HelpDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
};

export default PlatformFooter;
