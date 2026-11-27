import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CookieSettingsSection } from '@/crd/components/user/settings/CookieSettingsSection';
import { useConfig } from '@/domain/platform/config/useConfig';
import { COOKIE_POLICY_URL, useCookieSettings } from './CookieSettingsProvider';
import { useAlkemioCookies } from './useAlkemioCookies';

/**
 * Connector for the Security tab's cookie section. Each Analytics change is stored at once; the
 * switch reads the cookie back, so a change the browser refused shows the stored value again.
 */
export const CrdCookieSettingsSection = () => {
  const { t } = useTranslation('crd-layout');
  const { locations } = useConfig();
  const { consent } = useAlkemioCookies();
  const { saveCookieSettings } = useCookieSettings();
  const [error, setError] = useState<string>();

  return (
    <CookieSettingsSection
      analysis={consent.analysis}
      onAnalysisChange={analysis => setError(saveCookieSettings(analysis) ? undefined : t('cookieConsent.saveFailed'))}
      error={error}
      cookiePolicyHref={COOKIE_POLICY_URL}
      privacyPolicyHref={locations?.privacy}
    />
  );
};
