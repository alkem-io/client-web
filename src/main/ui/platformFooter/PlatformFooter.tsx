import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfig } from '../../../domain/platform/config/useConfig';
import LanguageSelect from '../layout/topBar/LanguageSelect';
import HelpDialog from '../../../core/help/dialog/HelpDialog';
import FooterLink from '../../../core/ui/layout/pageFooter/FooterLink';
import PageFooter from '../../../core/ui/layout/pageFooter/PageFooter';
import FooterLogo from './FooterLogo';

const PlatformFooter = () => {
  const { t } = useTranslation();
  const { platform } = useConfig();

  const [dialogOpen, setDialogOpen] = useState(false);

  const openHelpDialog = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <PageFooter logo={<FooterLogo />} copyright={t('footer.copyright')}>
        <FooterLink href={platform?.terms}>{t('footer.terms')}</FooterLink>
        <FooterLink href={platform?.privacy}>{t('footer.privacy')}</FooterLink>
        <FooterLink href={platform?.security}>{t('footer.security')}</FooterLink>
        <FooterLink onClick={openHelpDialog} sx={{ cursor: 'pointer' }}>
          {t('footer.support')}
        </FooterLink>
        <FooterLink href={platform?.about}>{t('footer.about')}</FooterLink>
        <LanguageSelect />
      </PageFooter>
      <HelpDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
};

export default PlatformFooter;
