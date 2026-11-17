import { AlertTriangle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NoticeBand } from '@/crd/components/common/NoticeBand';

type DownNoticeBannerProps = {
  onDismiss: () => void;
  className?: string;
};

/**
 * Full-width maintenance notice attached under the nav bar. Visual styling
 * mirrors the Space visibility notice (warning icon + amber surface).
 * Dismissal behavior is owned by the consumer via the `onDismiss` prop.
 */
export function DownNoticeBanner({ onDismiss, className }: DownNoticeBannerProps) {
  const { t } = useTranslation('crd-common');

  return (
    <NoticeBand className={className} aria-label={t('downNoticeBanner.a11yLabel')}>
      <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{t('downNoticeBanner.message')}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={t('downNoticeBanner.dismiss')}
        className="ml-auto shrink-0 rounded-md p-1 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </NoticeBand>
  );
}
