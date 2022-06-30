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
    <>
      <div
        style={{
          flex: '1 0 300px',
          margin: '15px',
        }}
      >
        {t('cookie.consent')}
      </div>
      <Button
        sx={{
          whiteSpace: 'nowrap',
          color: theme.palette.background.default,
          background: theme.palette.primary.dark,
        }}
        onClick={handleOpenSettings}
      >
        {t('buttons.settings')}
      </Button>
      <Button
        sx={{
          whiteSpace: 'nowrap',
          color: theme.palette.primary.dark,
          background: theme.palette.background.default,
          ':hover': {
            color: theme.palette.background.default,
            background: 'transparent',
          },
        }}
        onClick={acceptAllCookies}
      >
        {t('buttons.accept-all-cookies')}
      </Button>
    </>
  );
};

export default GeneralConsent;
