import { ShieldAlert, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NoticeBand } from '@/crd/components/common/NoticeBand';

type SecondFactorReminderBannerProps = {
  /** The deadline, already formatted for the reader's language. */
  deadline: string;
  securityHref: string;
  onDismiss: () => void;
  className?: string;
};

/**
 * Notice under the nav bar while a rule requires a second factor the person
 * has not set up yet: by when, and where to do it.
 */
export function SecondFactorReminderBanner({
  deadline,
  securityHref,
  onDismiss,
  className,
}: SecondFactorReminderBannerProps) {
  const { t } = useTranslation('crd-layout');

  return (
    <NoticeBand className={className}>
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
    </NoticeBand>
  );
}
