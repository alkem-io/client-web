import { Wifi, WifiOff, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';

type OnlineStatusBannerProps = {
  /**
   * `'offline'` shows the persistent, non-dismissable connectivity warning.
   * `'restored'` shows the dismissable "connection restored" confirmation.
   */
  variant: 'offline' | 'restored';
  /**
   * Called when the user dismisses the banner. Only rendered for the `'restored'` variant —
   * the offline banner is a persistent indicator and intentionally has no close affordance.
   */
  onClose?: () => void;
};

/**
 * Floating top-center banner reflecting browser connectivity. Purely presentational:
 * the consumer owns online/offline detection, debouncing, auto-dismiss timing, and logging.
 *
 * `pointer-events-auto` on the card is deliberate — when a Radix modal is mounted it sets
 * `pointer-events: none` on <body>, which this globally-mounted banner would otherwise inherit,
 * leaving the close button unclickable.
 */
export function OnlineStatusBanner({ variant, onClose }: OnlineStatusBannerProps) {
  const { t } = useTranslation('crd-layout');
  const isOffline = variant === 'offline';
  const Icon = isOffline ? WifiOff : Wifi;
  const tone = isOffline ? 'text-muted-foreground' : 'text-green-700';

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[1500] flex justify-center p-4">
      <output className="crd-root pointer-events-auto flex max-w-xl items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-lg">
        <Icon aria-hidden="true" className={cn('size-5 shrink-0', tone)} />
        <p className={cn('text-body', tone)}>{t(isOffline ? 'onlineStatus.offline' : 'onlineStatus.restored')}</p>
        {!isOffline && onClose && (
          <button
            type="button"
            aria-label={t('onlineStatus.close')}
            onClick={onClose}
            className="ml-1 shrink-0 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        )}
      </output>
    </div>
  );
}
