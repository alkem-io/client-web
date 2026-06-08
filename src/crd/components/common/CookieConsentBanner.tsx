import type { Ref } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import { Checkbox } from '@/crd/primitives/checkbox';

type CookieConsentBannerProps = {
  /** Forwarded to the root element so the consumer can measure the banner height and pad the page. */
  ref?: Ref<HTMLDivElement>;
  onAcceptAll: () => void;
  /** Confirm the granular choice. Technical cookies are always accepted; only the analysis opt-in varies. */
  onConfirm: (analysisAccepted: boolean) => void;
};

/**
 * Cookie consent banner. Two-step flow mirroring the legacy MUI version: a general
 * accept-all prompt, and a settings view where the analysis cookie can be toggled.
 * Purely presentational — persistence and analytics wiring live in the consumer.
 */
export function CookieConsentBanner({ ref, onAcceptAll, onConfirm }: CookieConsentBannerProps) {
  const { t } = useTranslation('crd-layout');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analysisAccepted, setAnalysisAccepted] = useState(false);

  return (
    <div
      ref={ref}
      className="crd-root pointer-events-auto fixed inset-x-0 bottom-0 z-[1500] border-t border-border bg-card text-card-foreground shadow-lg"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 p-4">
        {!settingsOpen ? (
          <>
            <p className="text-body min-w-[300px] flex-1">{t('cookieConsent.consent')}</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setSettingsOpen(true)}>
                {t('cookieConsent.settings')}
              </Button>
              <Button onClick={onAcceptAll}>{t('cookieConsent.acceptAll')}</Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex min-w-[300px] flex-1 flex-col gap-3">
              <p className="text-body">{t('cookieConsent.settingsIntro')}</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <Checkbox id="cookie-technical" checked={true} disabled={true} className="mt-0.5" />
                  <label htmlFor="cookie-technical" className="text-body">
                    {t('cookieConsent.technical')}
                  </label>
                </div>
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="cookie-analysis"
                    checked={analysisAccepted}
                    onCheckedChange={value => setAnalysisAccepted(value === true)}
                    className="mt-0.5"
                  />
                  <label htmlFor="cookie-analysis" className="text-body">
                    {t('cookieConsent.analysis')}
                  </label>
                </div>
              </div>
            </div>
            <Button onClick={() => onConfirm(analysisAccepted)}>{t('cookieConsent.confirmChoice')}</Button>
          </>
        )}
      </div>
    </div>
  );
}
