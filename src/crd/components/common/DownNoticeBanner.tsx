import { AlertTriangle, X } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';

type DownNoticeBannerProps = {
  onDismiss: () => void;
  className?: string;
};

/**
 * Full-width incident notice attached under the nav bar. Visual styling mirrors
 * the Space visibility notice (warning icon + amber surface). Dismissal behavior
 * is owned by the consumer via the `onDismiss` prop.
 */
export function DownNoticeBanner({ onDismiss, className }: DownNoticeBannerProps) {
  const { t } = useTranslation('crd-common');

  return (
    <output
      className={cn(
        'flex items-center gap-2 px-4 py-3 border-b bg-amber-50 text-amber-800 border-amber-200 text-body',
        className
      )}
      aria-label={t('downNoticeBanner.a11yLabel')}
    >
      <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>
        <Trans
          t={t}
          i18nKey="downNoticeBanner.message"
          components={{
            support: (
              <a href="mailto:support@alkemio.com" className="underline font-medium hover:no-underline">
                support@alkemio.com
              </a>
            ),
          }}
        />
      </span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={t('downNoticeBanner.dismiss')}
        className="ml-auto shrink-0 rounded-md p-1 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </output>
  );
}
