import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

export type GuestReturnNoticeProps = {
  /** Invoked when the guest activates "Back to whiteboard". The consumer navigates; the guest session is preserved. */
  onBackToWhiteboard: () => void;
  /** Invoked when the guest activates "Go to our website". The consumer navigates; the guest session is preserved. */
  onGoToWebsite: () => void;
  /** Optional className passthrough for layout composition by the consumer. */
  className?: string;
};

/**
 * "You've left your whiteboard" card shown above the sign-up form when an active
 * guest whiteboard session is detected. Purely presentational — the consumer
 * supplies the action callbacks and decides what navigation happens.
 */
export function GuestReturnNotice({ onBackToWhiteboard, onGoToWebsite, className }: GuestReturnNoticeProps) {
  const { t } = useTranslation('crd-auth');

  return (
    <section
      aria-label={t('guestReturn.title')}
      className={cn('rounded-lg bg-card px-9 py-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)]', className)}
    >
      {/* Styled as a non-heading: the notice sits above the SignUpCard's <h1>, so a
          real heading here would put an h2 before the page's h1. The <section> is
          named via aria-label instead, keeping a single, ordered heading hierarchy. */}
      <p className="text-section-title font-bold text-foreground">{t('guestReturn.title')}</p>
      <p className="mt-3 text-body text-muted-foreground">{t('guestReturn.description')}</p>

      <div className="mt-6 flex flex-col gap-3">
        <Button type="button" className="w-full" onClick={onBackToWhiteboard}>
          <ArrowLeft aria-hidden="true" />
          {t('guestReturn.backButton')}
        </Button>
        <Button type="button" variant="outline" className="w-full" onClick={onGoToWebsite}>
          {t('guestReturn.websiteButton')}
        </Button>
      </div>

      <div className="mt-5 flex flex-col gap-1 rounded-lg bg-accent p-5 text-center">
        <p className="flex items-center justify-center gap-2 text-body-emphasis text-foreground">
          {t('guestReturn.contributeTitle')}
          <ArrowRight aria-hidden="true" className="size-4" />
        </p>
        <p className="text-caption text-muted-foreground">{t('guestReturn.contributeDescription')}</p>
      </div>
    </section>
  );
}
