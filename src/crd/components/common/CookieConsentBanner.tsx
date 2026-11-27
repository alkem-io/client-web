import type { Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { CookieSaveError } from '@/crd/components/common/CookieSettingsOptions';
import { Button } from '@/crd/primitives/button';

type CookieConsentBannerProps = {
  /** Forwarded to the root element so the consumer can measure the banner height and pad the page. */
  ref?: Ref<HTMLElement>;
  onAcceptAll: () => void;
  onOnlyNecessary: () => void;
  onOpenSettings: () => void;
  /** Shown as an alert above the choices; the banner stays open. */
  error?: string;
};

// Both choices carry the same weight: one variant, one size, at least 44px high. Below md they
// share a wrapping row and stack on their own when a label does not fit (Bulgarian).
const choiceClassName = 'h-11 min-w-max flex-[1_1_calc(50%-4px)] md:flex-none';

/**
 * Cookie consent banner. Below md a bottom sheet (title row with Settings, short text, the
 * pair of choices); from md up the full-width bar. Settings opens the shared Cookie settings
 * sheet in the consumer. Purely presentational: persistence lives in the consumer.
 */
export function CookieConsentBanner({
  ref,
  onAcceptAll,
  onOnlyNecessary,
  onOpenSettings,
  error,
}: CookieConsentBannerProps) {
  const { t } = useTranslation('crd-layout');

  return (
    <section
      ref={ref}
      aria-label={t('cookieConsent.title')}
      // Interacting with the banner must never dismiss an open modal (Radix
      // treats clicks outside its layer as backdrop dismisses — e.g. accepting
      // cookies used to close the subspace About dialog and lose the context).
      data-dialog-dismiss-ignore=""
      className="crd-root pointer-events-auto fixed inset-x-0 bottom-0 z-[1500] rounded-t-2xl border-t border-border bg-card pb-[env(safe-area-inset-bottom)] text-card-foreground shadow-lg md:rounded-none md:pb-0"
    >
      {/* One Settings button for both layouts: beside the title below md, before the choices from md up. */}
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-4 gap-y-3 p-4">
        <h2 className="text-subheader flex-1 font-semibold md:hidden">{t('cookieConsent.title')}</h2>
        <Button variant="ghost" className="-mr-3 h-11 md:order-2 md:mr-0" onClick={onOpenSettings}>
          {t('cookieConsent.settings')}
        </Button>
        <p className="text-body basis-full md:order-1 md:min-w-[300px] md:flex-1 md:basis-0">
          {t('cookieConsent.text')}
        </p>
        {error && <CookieSaveError message={error} className="basis-full md:order-first" />}
        <div className="flex basis-full flex-wrap gap-2 md:order-3 md:basis-auto">
          <Button className={choiceClassName} onClick={onOnlyNecessary}>
            {t('cookieConsent.onlyNecessary')}
          </Button>
          <Button className={choiceClassName} onClick={onAcceptAll}>
            {t('cookieConsent.acceptAll')}
          </Button>
        </div>
      </div>
    </section>
  );
}
