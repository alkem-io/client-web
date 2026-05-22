import { useTranslation } from 'react-i18next';
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
    <div className="rounded-lg bg-card px-9 py-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
      <div className="mb-6">
        <AuthCardHeader
          contextLabel={t('signIn.noAccount')}
          contextLinkLabel={t('signIn.signUp')}
          contextLinkHref={signUpHref}
        />
      </div>

      <h1 className="text-hero mb-6 text-foreground">{t('recovery.title')}</h1>

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
    </div>
  );
}
