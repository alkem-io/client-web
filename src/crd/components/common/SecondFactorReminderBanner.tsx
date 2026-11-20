import { ShieldAlert, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NoticeBand } from '@/crd/components/common/NoticeBand';

type SecondFactorReminderBannerProps = {
  /** The deadline, already formatted for the reader's language. */
  deadline: string;
  /** Two-step verification is in use, but the account holds a single way to pass the second step. */
  secondWayNeeded?: boolean;
  securityHref: string;
  onDismiss: () => void;
  className?: string;
};

/**
 * Notice under the nav bar while a rule requires something of the person's
 * sign-in that it does not meet yet: a second factor, or a second way to pass
 * the second step. By when, and where to do it.
 */
export function SecondFactorReminderBanner({
  deadline,
  secondWayNeeded = false,
  securityHref,
  onDismiss,
  className,
}: SecondFactorReminderBannerProps) {
  const { t } = useTranslation('crd-layout');
  const copy = secondWayNeeded
    ? { text: t('secondFactorReminder.secondWayText', { deadline }), action: t('secondFactorReminder.secondWayAction') }
    : { text: t('secondFactorReminder.text', { deadline }), action: t('secondFactorReminder.action') };

  return (
    <NoticeBand className={className}>
      <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{copy.text}</span>
      <a
        href={securityHref}
        className="shrink-0 rounded-sm font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {copy.action}
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
