import { AlertTriangle, Wrench, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NoticeBand } from '@/crd/components/common/NoticeBand';

type DownNoticeBannerProps = {
  kind: 'incident' | 'maintenanceScheduled' | 'maintenanceInProgress';
  /** The incident or maintenance title, shown as written. */
  name: string;
  /** When a planned maintenance starts, already formatted for the reader's language. Shown as given: use non-breaking spaces to keep it on one line. */
  scheduledFor?: string;
  statusHref?: string;
  onDismiss: () => void;
  className?: string;
};

/**
 * Full-width notice attached under the nav bar for an ongoing incident or a
 * maintenance. Visual styling mirrors the Space visibility notice (amber
 * surface). Dismissal behavior is owned by the consumer via the `onDismiss` prop.
 */
export function DownNoticeBanner({
  kind,
  name,
  scheduledFor,
  statusHref,
  onDismiss,
  className,
}: DownNoticeBannerProps) {
  const { t } = useTranslation('crd-common');
  const Icon = kind === 'incident' ? AlertTriangle : Wrench;
  const text = t(`downNoticeBanner.${kind}`, { name, date: scheduledFor });

  return (
    <NoticeBand className={className} aria-label={t('downNoticeBanner.a11yLabel')}>
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      {/* The link drops under the text on very small screens. */}
      <div className="flex min-w-0 flex-col items-start gap-x-2 sm:flex-row sm:items-center">
        <span>{text}</span>
        {statusHref ? (
          <a
            href={statusHref}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-sm font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('downNoticeBanner.viewStatus')}
          </a>
        ) : null}
      </div>
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
