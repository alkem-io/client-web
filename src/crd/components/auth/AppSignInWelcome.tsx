import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AlkemioLogo } from '@/crd/components/common/AlkemioLogo';
import { Button } from '@/crd/primitives/button';

export type AppSignInWelcomeProps = {
  /** Restarts sign-in at the OIDC entry. */
  signInHref: string;
  /** The sign-up page, carrying the pending destination when there is one. */
  createAccountHref: string;
  /** Public space explorer. The link is omitted when not provided. */
  browseSpacesHref?: string;
};

const CTA_CLASS = 'text-control h-12 w-full font-semibold uppercase tracking-wider';

/**
 * Full-height welcome screen the native app shows when it sends a signed-out
 * visitor to sign in: the brand, one line about Alkemio, and the same
 * sign-in / create-account buttons the web auth card uses. It replaces a
 * cramped card whose only content was a "Sign in to continue." notice.
 * Purely presentational — every href arrives via props.
 */
export function AppSignInWelcome({ signInHref, createAccountHref, browseSpacesHref }: AppSignInWelcomeProps) {
  const { t } = useTranslation('crd-auth');

  return (
    <div data-testid="app-signin-welcome" className="flex flex-1 flex-col pb-11">
      <div aria-hidden="true" className="flex-1" />

      <div className="flex flex-col items-center text-center">
        <AlkemioLogo aria-hidden="true" className="h-[77px] w-20" />
        <span className="text-section-title mt-4 font-bold uppercase text-foreground">Alkemio</span>
        <h1 className="text-display mt-7 max-w-[340px] leading-[1.15] text-foreground">{t('tagline')}</h1>
        <p className="text-subheader mt-3 max-w-[310px] font-normal text-muted-foreground">{t('appWelcome.body')}</p>
      </div>

      <div aria-hidden="true" className="flex-[1.3]" />

      <div className="flex flex-col gap-3">
        <Button asChild={true} className={CTA_CLASS}>
          <a href={signInHref}>{t('appWelcome.signIn')}</a>
        </Button>
        <Button asChild={true} variant="outline" className={CTA_CLASS}>
          <a href={createAccountHref}>{t('appWelcome.createAccount')}</a>
        </Button>
        {browseSpacesHref ? (
          <Button asChild={true} variant="ghost" className="text-body h-10 w-full font-semibold text-primary">
            <a href={browseSpacesHref}>
              {t('appWelcome.browseSpaces')}
              <ArrowRight aria-hidden="true" />
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
