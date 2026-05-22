import { useTranslation } from 'react-i18next';
import { AuthCardHeader } from '@/crd/components/auth/AuthCardHeader';
import { CrdKratosFlow } from '@/crd/components/auth/CrdKratosFlow';
import type { KratosFlowDescriptor } from '@/crd/components/auth/flowDescriptor';
import { Skeleton } from '@/crd/primitives/skeleton';

export type VerificationCardProps = {
  /** The adapted verification flow. While `undefined` (or `isLoading`), a skeleton renders. */
  descriptor?: KratosFlowDescriptor;
  signInHref: string;
  isLoading?: boolean;
};

export function VerificationCard({ descriptor, signInHref, isLoading }: VerificationCardProps) {
  const { t } = useTranslation('crd-auth');

  return (
    <div className="rounded-lg bg-card px-9 py-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
      <div className="mb-6">
        <AuthCardHeader
          contextLabel={t('signUp.haveAccount')}
          contextLinkLabel={t('signUp.signIn')}
          contextLinkHref={signInHref}
        />
      </div>

      <h1 className="text-hero mb-6 text-foreground">{t('verification.title')}</h1>

      {isLoading || !descriptor ? (
        <output aria-label={t('loading')} className="flex w-full flex-col gap-5">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-12 w-full" />
        </output>
      ) : (
        <CrdKratosFlow
          descriptor={descriptor}
          beforeInputs={
            // Only the email-entry stage needs the "check your inbox" intro —
            // once the email is sent or verified, Kratos's own flow messages
            // (and the "Continue" link) carry the right copy.
            descriptor.state === 'choose_method' ? (
              <p className="text-body text-muted-foreground">{t('verification.intro')}</p>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
