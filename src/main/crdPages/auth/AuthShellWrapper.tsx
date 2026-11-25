import type { ReactNode } from 'react';
import { AuthShell } from '@/crd/layouts/AuthShell';
import { useCookieSettings } from '@/main/cookies/CookieSettingsProvider';
import { useCrdNavigation } from '@/main/ui/layout/useCrdNavigation';

/**
 * Mounts the CRD `AuthShell` for the auth screens, wiring the footer's
 * language selector and link hrefs from the shared navigation hook. The
 * `AuthShell` itself is purely presentational; this is the integration glue.
 */
export function AuthShellWrapper({ children, wide, plain }: { children: ReactNode; wide?: boolean; plain?: boolean }) {
  const { footerLinks, languages, currentLanguage, handleLanguageChange } = useCrdNavigation();
  const { openCookieSettings } = useCookieSettings();

  return (
    <AuthShell
      languages={languages}
      currentLanguage={currentLanguage}
      onLanguageChange={handleLanguageChange}
      footerLinks={footerLinks}
      onCookieSettingsClick={openCookieSettings}
      wide={wide}
      plain={plain}
    >
      {children}
    </AuthShell>
  );
}
