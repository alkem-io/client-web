import { useTranslation } from 'react-i18next';
import { AuthCard } from '@/crd/components/auth/AuthCard';
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
    <AuthCard
      title={t('verification.title')}
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
    </AuthCard>
  );
}
