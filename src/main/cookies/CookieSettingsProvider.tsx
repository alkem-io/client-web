import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
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

  useEffect(() => {
    // Browsers that block site data throw on any sessionStorage access.
    try {
      if (!window.sessionStorage.getItem(SAVED_AFTER_RELOAD_KEY)) return;
      window.sessionStorage.removeItem(SAVED_AFTER_RELOAD_KEY);
    } catch {
      return;
    }
    notify(t('cookieConsent.saved'), 'success');
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    setError(undefined);
  };

  const saveCookieSettings = (analysis: boolean) => {
    const saved = saveConsent(analysis);
    if (!saved) return false;
    // The RUM agent cannot be stopped once it runs, so withdrawing reloads the page without it.
    if (!analysis && apm) {
      window.sessionStorage.setItem(SAVED_AFTER_RELOAD_KEY, '1');
      window.location.reload();
    } else {
      notify(t('cookieConsent.saved'), 'success');
    }
    return true;
  };

  const handleSave = (analysis: boolean) => {
    if (saveCookieSettings(analysis)) {
      handleOpenChange(false);
    } else {
      setError(t('cookieConsent.saveFailed'));
    }
  };

  return (
    <CookieSettingsContext value={{ openCookieSettings: () => handleOpenChange(true), saveCookieSettings }}>
      {children}
      <CookieSettingsSheet
        open={open}
        onOpenChange={handleOpenChange}
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
