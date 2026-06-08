import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';

type AppVersionBannerProps = {
  /** When the same version mismatch keeps reappearing, show the extra "close all tabs" line. */
  recurring: boolean;
  onReload: () => void;
};

/**
 * Floating banner shown when a newer app version is detected. Purely presentational:
 * the consumer owns version detection and the reload behaviour.
 *
 * `pointer-events-auto` on the card is deliberate — when a Radix modal (e.g. an open
 * callout dialog) is mounted, Radix sets `pointer-events: none` on <body>, which this
 * globally-mounted banner would otherwise inherit, leaving the Reload button unclickable.
 */
export function AppVersionBanner({ recurring, onReload }: AppVersionBannerProps) {
  const { t } = useTranslation('crd-layout');

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[1500] flex justify-center p-4">
      <output className="crd-root pointer-events-auto flex max-w-xl items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 text-card-foreground shadow-lg">
        <div className="flex flex-col gap-0.5">
          <p className="text-body">{t('appVersion.message')}</p>
          {recurring && <p className="text-caption text-muted-foreground">{t('appVersion.recurringMessage')}</p>}
        </div>
        <Button onClick={onReload}>{t('appVersion.reload')}</Button>
      </output>
    </div>
  );
}
