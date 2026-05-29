import { Trans, useTranslation } from 'react-i18next';
import { AuthCard } from '@/crd/components/auth/AuthCard';
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
        <CrdKratosFlow
          descriptor={descriptor}
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
      )}
    </AuthCard>
  );
}
