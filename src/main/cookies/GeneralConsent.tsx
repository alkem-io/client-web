import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import { useAlkemioCookies } from './useAlkemioCookies';
import TextContainer from './components/TextContainer';
import { Actions } from '@/core/ui/actions/Actions';

interface GeneralConsentProps {
  handleOpenSettings: () => void;
}

const GeneralConsent: FC<GeneralConsentProps> = ({ handleOpenSettings }: GeneralConsentProps) => {
  const { t } = useTranslation();
  const { acceptAllCookies } = useAlkemioCookies();

  return (
    <>
      <TextContainer>{t('cookie.consent')}</TextContainer>
      <Actions>
        <Button
          variant="contained"
          sx={{
            width: '150px',
          }}
          onClick={handleOpenSettings}
        >
          {t('common.settings')}
        </Button>
        <Button
          variant="contained"
          sx={{
            whiteSpace: 'nowrap',
          }}
          onClick={acceptAllCookies}
        >
          {t('buttons.accept-all-cookies')}
        </Button>
      </Actions>
    </>
  );
};

export default GeneralConsent;
