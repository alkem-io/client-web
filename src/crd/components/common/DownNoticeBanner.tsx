import { AlertTriangle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { contentColumnClass } from '@/crd/lib/contentColumn';
import { cn } from '@/crd/lib/utils';

type DownNoticeBannerProps = {
  onDismiss: () => void;
  className?: string;
};

/**
 * Full-width maintenance notice attached under the nav bar. Visual styling
 * mirrors the Space visibility notice (warning icon + amber surface). The amber
 * band spans the viewport, while its contents sit in the same inset grid band as
 * `Header` — so the text lines up with the Alkemio logo on the left and the
 * dismiss button with the user avatar on the right. Dismissal behavior is owned
 * by the consumer via the `onDismiss` prop.
 */
export function DownNoticeBanner({ onDismiss, className }: DownNoticeBannerProps) {
  const { t } = useTranslation('crd-common');

  return (
    <output
      className={cn('block border-b bg-amber-50 text-amber-800 border-amber-200 text-body', className)}
      aria-label={t('downNoticeBanner.a11yLabel')}
    >
      {/* Padding / grid / column span kept in sync with `Header`'s inner band. */}
      <div className="w-full px-6 md:px-8">
        <div className="grid grid-cols-12 gap-6">
          <div className={cn('col-span-12 flex items-center gap-2 py-3 lg:px-3', contentColumnClass())}>
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
          </div>
        </div>
      </div>
    </output>
  );
}
