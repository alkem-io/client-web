import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Box, Button, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { useGlobalError } from './GlobalErrorContext';
import { LazyLoadError } from './lazyWithGlobalErrorHandler';
import TranslationKey from '@/core/i18n/utils/TranslationKey';

const ErrorTranslationMappings = (error: Error): TranslationKey => {
  if (error instanceof LazyLoadError) {
    return 'pages.error.errors.LazyLoadError';
  }
  return 'pages.error.errors.unknown';
};

const GlobalErrorDialog: React.FC = () => {
  const { t } = useTranslation();
  const { error, setError } = useGlobalError();

  if (!error) return null;

  return (
    <Dialog open={!!error} aria-labelledby="global-error-dialog" onClose={() => setError(null)}>
      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
        {t('pages.error.title')}
      </DialogTitle>
      <DialogContent>
        <Box>
          <Trans
            i18nKey="pages.error.line1"
            values={{
              message: t(ErrorTranslationMappings(error)),
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

export default GlobalErrorDialog;
