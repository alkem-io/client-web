import { Trans, useTranslation } from 'react-i18next';
import { AuthCardHeader } from '@/crd/components/auth/AuthCardHeader';
import { CrdKratosFlow } from '@/crd/components/auth/CrdKratosFlow';
import type { KratosFlowDescriptor, KratosPasskeyTrigger } from '@/crd/components/auth/flowDescriptor';
import { AcceptTermsCheckbox } from '@/crd/forms/AcceptTermsCheckbox';
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
  onProviderClick,
  onPasskeyTrigger,
}: SignUpCardProps) {
  const { t } = useTranslation('crd-auth');

  const policyLink = (href: string) => (
    // biome-ignore lint/a11y/useAnchorContent: <Trans> injects the link text.
    <a href={href} target="_blank" rel="noreferrer" className="font-medium underline" />
  );

  return (
    <div className="rounded-lg bg-card px-9 py-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
      <div className="mb-6">
        <AuthCardHeader
          contextLabel={t('signUp.haveAccount')}
          contextLinkLabel={t('signUp.signIn')}
          contextLinkHref={signInHref}
        />
      </div>

      <h1 className="text-hero mb-6 text-foreground">{t('signUp.title')}</h1>

      {isLoading || !descriptor ? (
        <output aria-label={t('loading')} className="flex w-full flex-col gap-5">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-12 w-full" />
        </output>
      ) : (
        <CrdKratosFlow
          descriptor={descriptor}
          submitDisabled={Boolean(descriptor.acceptTerms) && !hasAcceptedTerms}
          beforeInputs={
            <div className="flex flex-col gap-4">
              <p className="text-body text-muted-foreground">
                <Trans
                  t={t}
                  i18nKey="signUp.intro"
                  components={{ terms: policyLink(termsOfUseHref), privacy: policyLink(privacyPolicyHref) }}
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
                      components={{ terms: policyLink(termsOfUseHref), privacy: policyLink(privacyPolicyHref) }}
                    />
                  }
                />
              ) : null}
            </div>
          }
          onProviderClick={onProviderClick}
          onPasskeyTrigger={onPasskeyTrigger}
        />
      )}
    </div>
  );
}
