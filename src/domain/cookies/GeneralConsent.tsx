import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material';
import Button from './components/Button';
import { useAlkemioCookies } from './useAlkemioCookies';

interface GeneralConsentProps {
  handleOpenSettings: () => void;
}

const GeneralConsent: FC<GeneralConsentProps> = ({ handleOpenSettings }: GeneralConsentProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { acceptAllCookies } = useAlkemioCookies();

  return (
    <div>
      {t('cookie.consent')}
      <Button
        style={{ float: 'right', width: '200px', color: theme.palette.primary.dark, background: '#FFFFFF' }}
        onClick={acceptAllCookies}
      >
        {t('buttons.accept-all-cookies')}
      </Button>
      <Button
        style={{ float: 'right', width: '150px', color: '#FFFFFF', background: theme.palette.primary.dark }}
        onClick={handleOpenSettings}
      >
        {t('buttons.settings')}
      </Button>
    </div>
  );
};

export default GeneralConsent;
