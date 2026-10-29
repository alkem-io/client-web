import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AlkemioLogo } from '@/crd/components/common/AlkemioLogo';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

export type AppSignInWelcomeProps = {
  /** Restarts sign-in at the OIDC entry. */
  signInHref: string;
  /** Public space explorer. The link is omitted when not provided. */
  browseSpacesHref?: string;
  /**
   * Already-translated reason shown above the buttons, e.g. after a cancelled
   * sign-in. `'destructive'` announces assertively; `'info'` politely.
   */
  message?: { text: string; tone: 'info' | 'destructive' };
};

/**
 * Full-height welcome screen the native app shows when it sends a signed-out
 * visitor to sign in, or back after a cancelled or failed attempt: the brand,
 * one line about Alkemio, an optional reason, the same sign-in button the
 * web auth card uses, and a way to browse public spaces. There is no sign-up
 * entry: inside the app the shell turns sign-up into the OIDC sign-in.
 * Purely presentational — every href arrives via props.
 */
export function AppSignInWelcome({ signInHref, browseSpacesHref, message }: AppSignInWelcomeProps) {
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

      {message ? (
        <p
          role={message.tone === 'destructive' ? 'alert' : 'status'}
          className={cn(
            'text-caption mb-4 text-center',
            message.tone === 'destructive' ? 'text-destructive' : 'text-muted-foreground'
          )}
        >
          {message.text}
        </p>
      ) : null}

      <div className="flex flex-col gap-3">
        <Button asChild={true} className="text-control h-12 w-full font-semibold uppercase tracking-wider">
          <a href={signInHref}>{t('appWelcome.signIn')}</a>
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
