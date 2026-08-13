/**
 * T007 — Language offer banner (CRD layer — purely presentational).
 *
 * FR-020: non-blocking, dismissible strip — NEVER a modal, never gates anything.
 * FR-007: copy rendered IN the offered language (not the current UI language).
 * FR-020a: accept and decline are the only explicit actions; dismiss = decline.
 *
 * Note: The banner must be rendered inside a CRD namespace i18n instance that
 * has already loaded the 'crd-language' namespace for the OFFERED language (not
 * the current UI language). The consumer (CrdLayoutWrapper) handles this by
 * passing pre-translated strings as props.
 */
import { X } from 'lucide-react';
import { Button } from '@/crd/primitives/button';

export type LanguageOfferBannerProps = {
  /** The language being offered (e.g. 'nl'). Used as aria label info. */
  offeredLanguage: string;
  /** Banner title in the offered language (FR-007). */
  title: string;
  /** Accept-button label in the offered language. */
  acceptLabel: string;
  /** Decline-button label in the offered language. */
  declineLabel: string;
  /** Aria-label for the dismiss (×) button in the offered language (FR-007 / CRD no-hardcoded-text rule). */
  dismissLabel: string;
  /** Called when the user clicks Accept. */
  onAccept: () => void;
  /** Called when the user clicks Decline or dismisses by any means (FR-020a). */
  onDecline: () => void;
};

/**
 * Non-blocking offer banner. Dismiss (×) and decline are synonymous (FR-020a).
 * Never a modal. Never blocks any content, navigation, or action.
 */
export function LanguageOfferBanner({
  offeredLanguage,
  title,
  acceptLabel,
  declineLabel,
  dismissLabel,
  onAccept,
  onDecline,
}: LanguageOfferBannerProps) {
  return (
    <header
      data-testid="language-offer-banner"
      data-language={offeredLanguage}
      // Interacting with the banner must never dismiss an open modal.
      data-dialog-dismiss-ignore=""
      className="crd-root pointer-events-auto fixed inset-x-0 top-0 z-[1400] border-b border-border bg-card text-card-foreground shadow-md"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <p className="text-body min-w-0 flex-1 truncate">{title}</p>
        <div className="flex shrink-0 items-center gap-2">
          <Button size="sm" onClick={onAccept} aria-label={acceptLabel}>
            {acceptLabel}
          </Button>
          <Button variant="outline" size="sm" onClick={onDecline} aria-label={declineLabel}>
            {declineLabel}
          </Button>
          <button
            type="button"
            onClick={onDecline}
            aria-label={dismissLabel}
            className="ml-1 rounded p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
