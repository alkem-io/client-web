import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CookieSaveError, CookieSettingsOptions } from '@/crd/components/common/CookieSettingsOptions';
import { Button } from '@/crd/primitives/button';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/crd/primitives/sheet';

type CookieSettingsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The Analytics switch starts here every time the sheet opens. */
  initialAnalysis: boolean;
  onSave: (analysis: boolean) => void;
  /** Shown as an alert above the Save button; the sheet stays open. */
  error?: string;
  cookiePolicyHref: string;
  privacyPolicyHref?: string;
};

type SheetBodyProps = Omit<CookieSettingsSheetProps, 'open' | 'onOpenChange'>;

// Mounted only while the sheet is open, so the unsaved switch state starts over on every open.
function SheetBody({ initialAnalysis, onSave, error, cookiePolicyHref, privacyPolicyHref }: SheetBodyProps) {
  const { t } = useTranslation('crd-layout');
  const [analysis, setAnalysis] = useState(initialAnalysis);

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto px-4">
        <CookieSettingsOptions
          analysis={analysis}
          onAnalysisChange={setAnalysis}
          cookiePolicyHref={cookiePolicyHref}
          privacyPolicyHref={privacyPolicyHref}
        />
      </div>
      <SheetFooter className="border-t border-border">
        {error && <CookieSaveError message={error} />}
        <Button className="h-11 w-full" onClick={() => onSave(analysis)}>
          {t('cookieConsent.saveSettings')}
        </Button>
      </SheetFooter>
    </>
  );
}

/**
 * Cookie settings as a bottom sheet at every width. Layered above the cookie banner
 * (z-[1500]) and the bottom menu bars, so it can open from the banner or the footer.
 */
export function CookieSettingsSheet({ open, onOpenChange, ...bodyProps }: CookieSettingsSheetProps) {
  const { t } = useTranslation('crd-layout');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        closeLabel={t('cookieConsent.close')}
        aria-describedby={undefined}
        overlayClassName="z-[1600]"
        className="z-[1600] mx-auto max-h-[76dvh] max-w-2xl gap-0 rounded-t-2xl pb-[env(safe-area-inset-bottom)]"
      >
        <div className="mx-auto mt-2 h-1 w-9 rounded-full bg-border" aria-hidden="true" />
        <SheetHeader className="pr-12">
          <SheetTitle className="text-subsection-title">{t('cookieConsent.settingsTitle')}</SheetTitle>
        </SheetHeader>
        <SheetBody {...bodyProps} />
      </SheetContent>
    </Sheet>
  );
}
