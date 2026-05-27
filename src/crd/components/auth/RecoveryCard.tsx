import { useTranslation } from 'react-i18next';
import { AuthCard } from '@/crd/components/auth/AuthCard';
import { AuthCardHeader } from '@/crd/components/auth/AuthCardHeader';
import { CrdKratosFlow } from '@/crd/components/auth/CrdKratosFlow';
import type { KratosFlowDescriptor } from '@/crd/components/auth/flowDescriptor';
import { Skeleton } from '@/crd/primitives/skeleton';

export type RecoveryCardProps = {
  /**
   * The adapted recovery flow. Renders whichever stage the flow is at —
   * the email-entry stage, the recovery-code stage, or the set-new-password
   * stage — since `CrdKratosFlow` renders whatever fields the flow exposes.
   * While `undefined` (or `isLoading`), a skeleton renders.
   */
  descriptor?: KratosFlowDescriptor;
  signUpHref: string;
  isLoading?: boolean;
};

export function RecoveryCard({ descriptor, signUpHref, isLoading }: RecoveryCardProps) {
  const { t } = useTranslation('crd-auth');

  return (
    <AuthCard
      title={t('recovery.title')}
      header={
        <AuthCardHeader
          contextLabel={t('signIn.noAccount')}
          contextLinkLabel={t('signIn.signUp')}
          contextLinkHref={signUpHref}
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
          beforeInputs={<p className="text-body text-muted-foreground">{t('recovery.intro')}</p>}
        />
      )}
    </AuthCard>
  );
}
