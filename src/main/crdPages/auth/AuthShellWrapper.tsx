import type { ReactNode } from 'react';
import { AuthShell } from '@/crd/layouts/AuthShell';
import { useCrdNavigation } from '@/main/ui/layout/useCrdNavigation';

/**
 * Mounts the CRD `AuthShell` for the auth screens, wiring the footer's
 * language selector and link hrefs from the shared navigation hook. The
 * `AuthShell` itself is purely presentational; this is the integration glue.
 */
export function AuthShellWrapper({ children }: { children: ReactNode }) {
  const { footerLinks, languages, currentLanguage, handleLanguageChange } = useCrdNavigation();

  return (
    <AuthShell
      languages={languages}
      currentLanguage={currentLanguage}
      onLanguageChange={handleLanguageChange}
      footerLinks={footerLinks}
    >
      {children}
    </AuthShell>
  );
}
