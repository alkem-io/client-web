import { type FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTransactionScope } from '@/core/analytics/SentryTransactionScopeContext';
import { isInputNode } from '@/core/auth/authentication/components/Kratos/helpers';
import { AUTH_SIGN_UP_PATH } from '@/core/auth/authentication/constants/authentication.constants';
import useKratosFlow, { FlowTypeName } from '@/core/auth/authentication/hooks/useKratosFlow';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { useQueryParams } from '@/core/routing/useQueryParams';
import { RecoveryCard } from '@/crd/components/auth/RecoveryCard';
import { AuthShellWrapper } from './AuthShellWrapper';
import { flowDescriptorAdapter } from './flowDescriptorAdapter';
import { useTranslateDescriptor } from './useKratosMessageCopy';

// Resend cooldown — mirrors the MUI `RecoveryPage`. After the recovery email is
// requested, the resend submit is blocked for 30s and relabelled "Continue in Ns".
// Persisted in sessionStorage so it survives the full-page POST/redirect Kratos
// performs (the component remounts on the returned `sent_email` flow).
const COOLDOWN_SECONDS = 30;
const COOLDOWN_STORAGE_KEY = 'alkemio-recovery-cooldown-until';

const readRemainingCooldown = (): number => {
  const stored = sessionStorage.getItem(COOLDOWN_STORAGE_KEY);
  if (!stored) return 0;
  const expiry = Number(stored);
  if (!Number.isFinite(expiry)) return 0;
  const remaining = Math.ceil((expiry - Date.now()) / 1000);
  if (remaining <= 0) {
    sessionStorage.removeItem(COOLDOWN_STORAGE_KEY);
    return 0;
  }
  return Math.min(remaining, COOLDOWN_SECONDS);
};

/**
 * CRD `/recovery` route — the un-gated replacement for the MUI `RecoveryRoute`.
 * `CrdKratosFlow` renders whichever stage the recovery flow is at (email entry,
 * recovery code, or set-new-password), so a single card serves the whole flow.
 */
export function RecoveryCrdRoute() {
  useTransactionScope({ type: 'authentication' });
  const { t } = useTranslation();
  usePageTitle(t('pages.recovery.header'));

  const params = useQueryParams();
  const flowId = params.get('flow') || undefined;
  const { flow: recoveryFlow, loading } = useKratosFlow(FlowTypeName.Recovery, flowId);
  const translateDescriptor = useTranslateDescriptor();

  const [cooldownRemaining, setCooldownRemaining] = useState<number>(() => readRemainingCooldown());

  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const interval = setInterval(() => {
      setCooldownRemaining(readRemainingCooldown());
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownRemaining]);

  const baseDescriptor = recoveryFlow ? flowDescriptorAdapter(recoveryFlow, 'recovery') : undefined;
  const descriptor = baseDescriptor ? translateDescriptor(baseDescriptor) : undefined;

  // The cooldown only applies to the email-request stage; the recovery-code stage
  // exposes a `code` input and must stay free to submit immediately.
  const hasCodeInput = Boolean(
    recoveryFlow?.ui.nodes.some(node => isInputNode(node) && node.attributes.name === 'code')
  );
  const isEmailStage = Boolean(recoveryFlow) && !hasCodeInput;
  const isCoolingDown = isEmailStage && cooldownRemaining > 0;
  const hasEmailSentNotice = recoveryFlow?.ui.messages?.some(message => message.type === 'info') ?? false;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (!isEmailStage) {
      return;
    }
    if (cooldownRemaining > 0) {
      event.preventDefault();
      return;
    }
    // Only persist to storage here — do NOT setState. A re-render before the browser
    // collects form data would disable the submit button and drop its `method=<strategy>`
    // value from the POST body, causing Kratos to reject the request.
    sessionStorage.setItem(COOLDOWN_STORAGE_KEY, String(Date.now() + COOLDOWN_SECONDS * 1000));
  };

  const submitLabelOverride = isCoolingDown
    ? (label: string) => t('pages.recovery.cooldown.button', { label, seconds: cooldownRemaining })
    : undefined;

  return (
    <AuthShellWrapper>
      <RecoveryCard
        descriptor={descriptor}
        isLoading={loading}
        signUpHref={AUTH_SIGN_UP_PATH}
        submitDisabled={isCoolingDown}
        submitLabelOverride={submitLabelOverride}
        onSubmit={handleSubmit}
        showResendNotice={isEmailStage && hasEmailSentNotice}
      />
    </AuthShellWrapper>
  );
}
