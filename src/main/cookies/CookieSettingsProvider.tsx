import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApm } from '@/core/analytics/apm/context';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { CookieSettingsSheet } from '@/crd/components/common/CookieSettingsSheet';
import { useConfig } from '@/domain/platform/config/useConfig';
import { useAlkemioCookies } from './useAlkemioCookies';

// The platform config has no cookie policy location; the welcome site, which reads the same
// consent cookie, publishes the policy.
export const COOKIE_POLICY_URL = 'https://welcome.alkem.io/legal/cookies';
// Carries the "saved" confirmation across the reload that a withdrawal triggers.
const SAVED_AFTER_RELOAD_KEY = 'alkemio.cookieSettingsSaved';

type CookieSettingsContextValue = {
  /** Opens the one Cookie settings sheet, showing the stored choice. */
  openCookieSettings: () => void;
  /** Stores the choice and shows the "saved" toast; false when the browser did not keep it. */
  saveCookieSettings: (analysis: boolean) => boolean;
};

const CookieSettingsContext = createContext<CookieSettingsContextValue>({
  openCookieSettings: () => {},
  saveCookieSettings: () => false,
});

export const CookieSettingsProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation('crd-layout');
  const { locations } = useConfig();
  const { consent, saveConsent } = useAlkemioCookies();
  const notify = useNotification();
  const apm = useApm();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const openerRef = useRef<Element | null>(null);

  useEffect(() => {
    // Browsers that block site data throw on any sessionStorage access.
    // The marker holds the message itself: right after a reload the account language is not applied yet.
    let saved: string | null;
    try {
      saved = window.sessionStorage.getItem(SAVED_AFTER_RELOAD_KEY);
      if (saved) window.sessionStorage.removeItem(SAVED_AFTER_RELOAD_KEY);
    } catch {
      return;
    }
    if (saved) notify(saved, 'success');
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    setError(undefined);
  };

  const saveCookieSettings = (analysis: boolean) => {
    const saved = saveConsent(analysis);
    if (!saved) return false;
    // A running RUM agent cannot be stopped, so ApmProvider reloads the page once consent is gone.
    // The marker carries the confirmation across that reload.
    if (!analysis && apm) {
      try {
        window.sessionStorage.setItem(SAVED_AFTER_RELOAD_KEY, t('cookieConsent.saved'));
      } catch {
        // Storage is blocked: the choice is saved and the page still reloads, without the toast.
      }
    } else {
      notify(t('cookieConsent.saved'), 'success');
    }
    return true;
  };

  const openCookieSettings = () => {
    openerRef.current = document.activeElement;
    handleOpenChange(true);
  };

  // The sheet has no Radix trigger, so focus goes back to whatever opened it, if that is still there.
  const restoreFocus = (event: Event) => {
    const opener = openerRef.current;
    if (opener instanceof HTMLElement && opener.isConnected) {
      event.preventDefault();
      opener.focus();
    }
  };

  const handleSave = (analysis: boolean) => {
    if (saveCookieSettings(analysis)) {
      handleOpenChange(false);
    } else {
      setError(t('cookieConsent.saveFailed'));
    }
  };

  return (
    <CookieSettingsContext value={{ openCookieSettings, saveCookieSettings }}>
      {children}
      <CookieSettingsSheet
        open={open}
        onOpenChange={handleOpenChange}
        onCloseAutoFocus={restoreFocus}
        initialAnalysis={consent.analysis}
        onSave={handleSave}
        error={error}
        cookiePolicyHref={COOKIE_POLICY_URL}
        privacyPolicyHref={locations?.privacy}
      />
    </CookieSettingsContext>
  );
};

export const useCookieSettings = () => useContext(CookieSettingsContext);
