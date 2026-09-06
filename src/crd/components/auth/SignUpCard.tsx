import { Trans, useTranslation } from 'react-i18next';
import { AuthCard } from '@/crd/components/auth/AuthCard';
import { AuthCardHeader } from '@/crd/components/auth/AuthCardHeader';
import { CrdKratosFlow } from '@/crd/components/auth/CrdKratosFlow';
import type { KratosFlowDescriptor, KratosPasskeyTrigger } from '@/crd/components/auth/flowDescriptor';
import { OrContinueWithDivider } from '@/crd/components/auth/OrContinueWithDivider';
import { AcceptTermsCheckbox } from '@/crd/forms/AcceptTermsCheckbox';
import { Button } from '@/crd/primitives/button';
import { Skeleton } from '@/crd/primitives/skeleton';

export type SignUpCardProps = {
  /** The adapted registration flow. While `undefined` (or `isLoading`), a skeleton renders. */
  descriptor?: KratosFlowDescriptor;
  signInHref: string;
  termsOfUseHref: string;
  privacyPolicyHref: string;
  /** Whether the accept-terms box is ticked (owned by the consumer for persistence). */
  hasAcceptedTerms: boolean;
  onAcceptedTermsChange: (accepted: boolean) => void;
  isLoading?: boolean;
  /**
   * When true, renders the "you may already have an account" signpost above
   * the form (FR-013). Set by the consumer when the loaded registration flow
   * evidences arrival via an identity provider rather than a direct choice
   * to register (FR-014 — absent otherwise). Plain in-flow content, present
   * at render — no live region needed, since nothing changes after mount.
   */
  showSignpost?: boolean;
  /**
   * When true, the loaded flow is an OIDC continuation — the person came back
   * from a provider's identity check to finish creating the account. The card
   * then explains the form (a heading naming the provider and a sentence on
   * where the prefilled details came from) and renders the provider submit as
   * the form's labeled primary CTA instead of an unexplained icon circle.
   * Unlike `showSignpost` (FR-014-gated), this is set for EVERY provider
   * continuation regardless of how the person arrived.
   */
  providerContinuation?: boolean;
  onProviderClick?: (providerKey: string) => void;
  onPasskeyTrigger?: (trigger: KratosPasskeyTrigger) => void;
};

export function SignUpCard({
  descriptor,
  signInHref,
  termsOfUseHref,
  privacyPolicyHref,
  hasAcceptedTerms,
  onAcceptedTermsChange,
  isLoading,
  showSignpost,
  providerContinuation,
  onProviderClick,
  onPasskeyTrigger,
}: SignUpCardProps) {
  const { t } = useTranslation('crd-auth');

  // The continuation's provider identity (icon + brand name) comes from the
  // flow's own OIDC submit node — no separate prop to drift out of sync.
  const continuationNode = providerContinuation ? descriptor?.groups.oidc[0] : undefined;
  const continuationBrand = continuationNode
    ? t(`providers.${continuationNode.value}` as 'providers.fallback', {
        defaultValue: continuationNode.label || continuationNode.customisation?.providerKey || '',
      }) || t('providers.fallback')
    : undefined;

  const policyLink = (href: string, ariaLabel: string) => (
    // biome-ignore lint/a11y/useAnchorContent: <Trans> injects the link text.
    <a href={href} target="_blank" rel="noreferrer" aria-label={ariaLabel} className="text-body-emphasis underline" />
  );

  return (
    <AuthCard
      title={t('signUp.title')}
      header={
        <AuthCardHeader
          contextLabel={t('signUp.haveAccount')}
          contextLinkLabel={t('signUp.signIn')}
          contextLinkHref={signInHref}
        />
      }
    >
      {isLoading || !descriptor ? (
        <output aria-label={t('loading')} className="flex w-full flex-col gap-5">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-12 w-full" />
        </output>
      ) : (
        <>
          {showSignpost ? (
            <div
              data-testid="signup-signpost"
              className="mb-5 flex flex-col gap-3 rounded-md border border-primary/15 bg-primary/5 p-4 text-body text-primary"
            >
              <p>{t('signUp.signpost.warning', { provider: continuationBrand ?? t('providers.fallback') })}</p>
              <Button asChild={true} variant="outline" className="text-control w-full">
                <a href={signInHref}>{t('signUp.signpost.signInAction')}</a>
              </Button>
            </div>
          ) : null}
          {continuationNode ? (
            <div className="mb-5 flex flex-col gap-2" data-testid="signup-continuation">
              {showSignpost ? <OrContinueWithDivider label={t('signUp.continuation.divider')} /> : null}
              <div className="flex flex-col gap-2.5">
                <h2 className="text-subsection-title flex items-center justify-center gap-2">
                  {t('signUp.continuation.heading', { provider: continuationBrand })}
                  {continuationNode.customisation?.iconSrc ? (
                    <img src={continuationNode.customisation.iconSrc} alt="" aria-hidden="true" className="size-5" />
                  ) : null}
                </h2>
                <p className="text-body text-center text-muted-foreground">{t('signUp.continuation.intro')}</p>
              </div>
            </div>
          ) : null}
          <CrdKratosFlow
            descriptor={descriptor}
            oidcSubmitCtaLabel={
              continuationNode ? t('signUp.continuation.cta', { provider: continuationBrand }) : undefined
            }
            submitDisabled={Boolean(descriptor.acceptTerms) && !hasAcceptedTerms}
            beforeInputs={
              <div className="flex flex-col gap-4">
                <p className="text-body text-muted-foreground">
                  <Trans
                    t={t}
                    i18nKey="signUp.intro"
                    components={{
                      terms: policyLink(termsOfUseHref, t('signUp.openTerms')),
                      privacy: policyLink(privacyPolicyHref, t('signUp.openPrivacy')),
                    }}
                  />
                </p>
                {descriptor.acceptTerms ? (
                  <AcceptTermsCheckbox
                    checked={hasAcceptedTerms}
                    onChange={onAcceptedTermsChange}
                    name={descriptor.acceptTerms.name}
                    value={descriptor.acceptTerms.value}
                    required={descriptor.acceptTerms.required}
                    label={
                      <Trans
                        t={t}
                        i18nKey="signUp.acceptTerms"
                        components={{
                          terms: policyLink(termsOfUseHref, t('signUp.openTerms')),
                          privacy: policyLink(privacyPolicyHref, t('signUp.openPrivacy')),
                        }}
                      />
                    }
                  />
                ) : null}
              </div>
            }
            onProviderClick={onProviderClick}
            onPasskeyTrigger={onPasskeyTrigger}
          />
        </>
      )}
    </AuthCard>
  );
}
