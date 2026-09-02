import type { ReactNode } from 'react';
import { AuthBackdrop } from '@/crd/components/auth/AuthBackdrop';
import { Footer } from '@/crd/layouts/Footer';
import type { CrdFooterLinks, CrdLanguageOption } from '@/crd/layouts/types';
import { cn } from '@/crd/lib/utils';

export type AuthShellProps = {
  /** The auth card content. */
  children: ReactNode;

  /** Language switcher wiring — passed straight to the shared CRD Footer. */
  languages: CrdLanguageOption[];
  currentLanguage: string;
  onLanguageChange: (code: string) => void;

  /** Footer link hrefs (Terms / Privacy / Security / About). */
  footerLinks?: CrdFooterLinks;
  /** Footer "Support" entry handler. */
  onSupportClick?: () => void;

  /**
   * Widens the content slot at `lg+` so the children can lay out as two columns
   * (e.g. a notice beside the auth card). Below `lg` the slot keeps the default
   * single-column width, so smaller screens are unaffected. Defaults to `false`.
   */
  wide?: boolean;
};

/**
 * Full-page shell shared by every CRD authentication screen: the frosted
 * dashboard backdrop, a vertically- and horizontally-centred card slot,
 * and the shared CRD footer. Purely presentational — behaviour arrives
 * via props.
 */
export function AuthShell({
  children,
  languages,
  currentLanguage,
  onLanguageChange,
  footerLinks,
  onSupportClick,
  wide,
}: AuthShellProps) {
  return (
    <div className="crd-root relative flex min-h-screen flex-col">
      <AuthBackdrop />

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-12 md:px-12 lg:px-24 xl:px-32">
        <div className={cn('w-full max-w-[420px]', wide && 'lg:max-w-[880px]')}>{children}</div>
      </main>

      <div className="relative z-10">
        <Footer
          links={footerLinks}
          languages={languages}
          currentLanguage={currentLanguage}
          onLanguageChange={onLanguageChange}
          onSupportClick={onSupportClick}
          className="border-t-0 bg-transparent"
        />
      </div>
    </div>
  );
}
