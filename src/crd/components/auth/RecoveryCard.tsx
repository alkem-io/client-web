import type { FormEvent, ReactNode } from 'react';
import { Trans, useTranslation } from 'react-i18next';
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
  /** Disables the submit button while the resend cooldown is active. */
  submitDisabled?: boolean;
  /** Overrides the submit button label during the cooldown (e.g. "Continue in 25s"). */
  submitLabelOverride?: (label: string) => ReactNode;
  /** Fired on form submit so the consumer can start the resend cooldown. */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  /** Once the recovery email has been sent, show the "haven't received it?" resend
   *  notice (with the cooldown advice) instead of the initial instructions. */
  showResendNotice?: boolean;
};

export function RecoveryCard({
  descriptor,
  signUpHref,
  isLoading,
  submitDisabled,
  submitLabelOverride,
  onSubmit,
  showResendNotice,
}: RecoveryCardProps) {
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
          submitDisabled={submitDisabled}
          submitLabelOverride={submitLabelOverride}
          onSubmit={onSubmit}
          beforeInputs={
            <p className="text-body text-muted-foreground">
              {showResendNotice ? (
                <Trans
                  t={t}
                  i18nKey="recovery.resendNotice"
                  components={{ strong: <strong className="font-semibold" />, br: <br /> }}
                />
              ) : (
                t('recovery.intro')
              )}
            </p>
          }
        />
      )}
    </AuthCard>
  );
}
