import { useTranslation } from 'react-i18next';

import { useGlobalError } from '@/core/lazyLoading/GlobalErrorContext';
import { LazyLoadError } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { CrdErrorDialog } from '@/crd/components/error/CrdErrorDialog';

/**
 * CRD counterpart of the MUI `GlobalErrorDialog`. Surfaces global errors (today,
 * failed lazy chunk loads) through the CRD dialog primitive. Reuses
 * `GlobalErrorContext` unchanged; the design dispatcher in `root.tsx` picks this
 * over the MUI dialog when CRD is enabled.
 */
export default function CrdGlobalErrorDialog() {
  const { t } = useTranslation('crd-error');
  const { error, setError } = useGlobalError();

  if (!error) {
    return null;
  }

  const message = error instanceof LazyLoadError ? t('chunkLoad.messages.lazyLoad') : t('chunkLoad.messages.unknown');

  return (
    <CrdErrorDialog
      open={Boolean(error)}
      onOpenChange={open => {
        if (!open) {
          setError(null);
        }
      }}
      title={t('chunkLoad.title')}
      message={message}
      reloadLabel={t('chunkLoad.actions.reload')}
      onReload={() => {
        setError(null);
        window.location.reload();
      }}
    />
  );
}
