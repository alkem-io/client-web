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

  /**
   * Renders the children as a full-height screen on the plain page background
   * instead of a centred card over the decorative backdrop. For content that is
   * the whole screen rather than a card. Defaults to `false`.
   */
  plain?: boolean;
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
  plain,
}: AuthShellProps) {
  return (
    <div className={cn('crd-root relative flex min-h-screen flex-col', plain && 'bg-background')}>
      {plain ? null : <AuthBackdrop />}

      <main
        className={cn(
          'relative z-10 flex flex-1 justify-center px-6 md:px-12 lg:px-24 xl:px-32',
          plain ? 'items-stretch' : 'items-center py-12'
        )}
      >
        <div className={cn('w-full max-w-[420px]', wide && 'lg:max-w-[880px]', plain && 'flex flex-col')}>
          {children}
        </div>
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
