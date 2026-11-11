import { ShieldAlert, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { contentColumnClass } from '@/crd/lib/contentColumn';
import { cn } from '@/crd/lib/utils';

type SecondFactorReminderBannerProps = {
  /** The deadline, already formatted for the reader's language. */
  deadline: string;
  securityHref: string;
  onDismiss: () => void;
  className?: string;
};

/**
 * Notice under the nav bar while a rule requires a second factor the person
 * has not set up yet: by when, and where to do it. Laid out like the other
 * full-width notices, in the same inset band as `Header`.
 */
export function SecondFactorReminderBanner({
  deadline,
  securityHref,
  onDismiss,
  className,
}: SecondFactorReminderBannerProps) {
  const { t } = useTranslation('crd-layout');

  return (
    <output className={cn('block border-b border-amber-200 bg-amber-50 text-amber-800 text-body', className)}>
      <div className="w-full px-6 md:px-8">
        <div className="grid grid-cols-12 gap-6">
          <div className={cn('col-span-12 flex items-center gap-2 py-3 lg:px-3', contentColumnClass())}>
            <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{t('secondFactorReminder.text', { deadline })}</span>
            <a
              href={securityHref}
              className="shrink-0 rounded-sm font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t('secondFactorReminder.action')}
            </a>
            <button
              type="button"
              onClick={onDismiss}
              aria-label={t('secondFactorReminder.dismiss')}
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
