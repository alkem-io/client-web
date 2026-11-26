import type { ReactNode } from 'react';
import { SentryTransactionScopeContextProvider } from '@/core/analytics/SentryTransactionScopeContext';
import { AuthShell } from '@/crd/layouts/AuthShell';
import { useCrdNavigation } from '@/main/ui/layout/useCrdNavigation';

export function AuthFlowContext({ children }: { children: ReactNode }) {
  return <SentryTransactionScopeContextProvider>{children}</SentryTransactionScopeContextProvider>;
}

/**
 * Mounts the CRD `AuthShell` for the auth screens, wiring the footer's
 * language selector and link hrefs from the shared navigation hook. The
 * `AuthShell` itself is purely presentational; this is the integration glue.
 */
export function AuthShellWrapper({ children, wide }: { children: ReactNode; wide?: boolean }) {
  const { footerLinks, languages, currentLanguage, handleLanguageChange } = useCrdNavigation();

  return (
    <AuthShell
      languages={languages}
      currentLanguage={currentLanguage}
      onLanguageChange={handleLanguageChange}
      footerLinks={footerLinks}
      wide={wide}
    >
      {children}
    </AuthShell>
  );
}
