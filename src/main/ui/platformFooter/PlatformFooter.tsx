import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import { type BoxProps, Button, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import HelpDialog from '@/core/help/dialog/HelpDialog';
import useLanguageSelect from '@/core/ui/language/useLanguageSelect';
import FooterLink from '@/core/ui/layout/pageFooter/FooterLink';
import PageFooter from '@/core/ui/layout/pageFooter/PageFooter';
import { Caption } from '@/core/ui/typography';
import { useConfig } from '@/domain/platform/config/useConfig';
import FooterLogo from './FooterLogo';

const PlatformFooter = (props: BoxProps) => {
  const { t } = useTranslation();
  const { locations } = useConfig();

  const [dialogOpen, setDialogOpen] = useState(false);

  const openHelpDialog = () => {
    setDialogOpen(true);
  };

  const { openSelect, menuProps, languages } = useLanguageSelect({
    anchorOrigin: {
      vertical: 'top',
      horizontal: 'left',
    },
    transformOrigin: {
      vertical: 'bottom',
      horizontal: 'left',
    },
  });

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
      </PageFooter>
      <Menu {...menuProps}>
        {languages.map(lng => (
          <MenuItem key={lng.key} selected={lng.selected} onClick={lng.onClick}>
            <Caption lang={lng.lang}>{lng.label}</Caption>
          </MenuItem>
        ))}
      </Menu>
      <HelpDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
};

export default PlatformFooter;
