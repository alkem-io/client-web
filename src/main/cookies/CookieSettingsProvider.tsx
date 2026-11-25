import { createContext, type ReactNode, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { CookieSettingsSheet } from '@/crd/components/common/CookieSettingsSheet';
import { useConfig } from '@/domain/platform/config/useConfig';
import { useAlkemioCookies } from './useAlkemioCookies';

// The platform config has no cookie policy location; the welcome site, which reads the same
// consent cookie, publishes the policy.
const COOKIE_POLICY_URL = 'https://welcome.alkem.io/legal/cookies';

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
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    setError(undefined);
  };

  const saveCookieSettings = (analysis: boolean) => {
    const saved = saveConsent(analysis);
    if (saved) notify(t('cookieConsent.saved'), 'success');
    return saved;
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
