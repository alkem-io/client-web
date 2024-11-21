import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Box, Button, Dialog, DialogContent } from '@mui/material';
import { useGlobalError } from './GlobalErrorContext';
import DialogHeader from '../ui/dialog/DialogHeader';
import { BlockTitle } from '../ui/typography';
import { LazyLoadError } from './lazyWithGlobalErrorHandler';
import TranslationKey from '../i18n/utils/TranslationKey';

const ErrorTranslationMapppings = (error: Error): TranslationKey => {
  if (error instanceof LazyLoadError) {
    return 'pages.error.errors.LazyLoadError';
  }
  return 'pages.error.errors.unknown';
};

export const GlobalErrorDialog: React.FC = () => {
  const { t } = useTranslation();
  const { error, setError } = useGlobalError();

  if (!error) return null;

  return (
    <Dialog open={!!error} aria-labelledby="global-error-dialog" onClose={() => setError(null)}>
      <DialogHeader onClose={() => setError(null)}>
        <BlockTitle>{t('pages.error.title')}</BlockTitle>
      </DialogHeader>
      <DialogContent>
        <Box>
          <Trans
            i18nKey="pages.error.line1"
            values={{
              message: t(ErrorTranslationMapppings(error)),
            }}
            components={{
              italic: <i />,
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <Button
            variant="contained"
            onClick={() => {
              setError(null);
              window.location.reload();
            }}
          >
            {t('pages.error.buttons.reload')}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
