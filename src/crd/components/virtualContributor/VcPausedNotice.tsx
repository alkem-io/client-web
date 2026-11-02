import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';

// TEMP: VCs disabled (#10398) — delete this component and its `vcPaused` keys in crd-common when VCs are back.

export const VC_PAUSED_LEARN_MORE_URL = 'https://alkem.io/docs/en-US/features/virtual-contributors';

type VcPausedNoticeProps = {
  className?: string;
};

/**
 * Explains that Virtual Contributors are temporarily paused, with links to the
 * docs page and to support. One component reused on the VC profile, the
 * account pages and Space settings → Community.
 */
export function VcPausedNotice({ className }: VcPausedNoticeProps) {
  const { t } = useTranslation('crd-common');
  const linkClass = 'text-primary underline-offset-4 hover:underline';

  return (
    <section
      aria-label={t('vcPaused.title')}
      className={cn('rounded-xl border border-primary/20 bg-primary/5 p-4 text-body', className)}
    >
      <p className="text-body-emphasis text-foreground">{t('vcPaused.title')}</p>
      <p className="mt-1 text-muted-foreground">{t('vcPaused.description')}</p>
      <p className="mt-2">
        <a href={VC_PAUSED_LEARN_MORE_URL} target="_blank" rel="noreferrer" className={linkClass}>
          {t('vcPaused.learnMore')}
        </a>
        <span aria-hidden="true" className="mx-2 text-muted-foreground">
          ·
        </span>
        <a href={`mailto:${t('common.supportEmail')}`} className={linkClass}>
          {t('vcPaused.contactSupport')}
        </a>
      </p>
    </section>
  );
}
