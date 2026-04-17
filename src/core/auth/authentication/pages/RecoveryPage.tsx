import { Alert, Box, Divider } from '@mui/material';
import type { UiContainer } from '@ory/kratos-client/dist/api';
import { type FC, type FormEvent, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import useKratosFlow, { FlowTypeName } from '@/core/auth/authentication/hooks/useKratosFlow';
import Loading from '@/core/ui/loading/Loading';
import { ErrorDisplay } from '@/domain/shared/components/ErrorDisplay';
import AuthPageContentContainer from '@/domain/shared/layout/AuthPageContentContainer';
import AuthenticationLayout from '../AuthenticationLayout';
import { AuthFormHeader } from '../components/AuthFormHeader';
import { isInputNode } from '../components/Kratos/helpers';
import KratosForm from '../components/Kratos/KratosForm';
import KratosUI from '../components/KratosUI';

interface RegisterPageProps {
  flow: string;
}

enum RecoveryFlowStage {
  Email = 'email',
  Code = 'code',
}

const COOLDOWN_SECONDS = 30;
const COOLDOWN_STORAGE_KEY = 'alkemio-recovery-cooldown-until';

const hasCodeInput = (ui: UiContainer) =>
  ui.nodes.some(node => isInputNode(node) && node.attributes.node_type === 'input' && node.attributes.name === 'code');

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

export const RecoveryPage: FC<RegisterPageProps> = ({ flow }) => {
  const { t } = useTranslation();
  const { flow: recoveryFlow, loading, error } = useKratosFlow(FlowTypeName.Recovery, flow);

  const [cooldownRemaining, setCooldownRemaining] = useState<number>(() => readRemainingCooldown());

  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const interval = setInterval(() => {
      setCooldownRemaining(readRemainingCooldown());
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownRemaining]);

  if (loading) {
    return <Loading text={t('kratos.loading-flow')} />;
  }

  if (error) {
    return <ErrorDisplay />;
  }

  const flowStage = recoveryFlow && (hasCodeInput(recoveryFlow.ui) ? RecoveryFlowStage.Code : RecoveryFlowStage.Email);
  const isEmailStage = flowStage === RecoveryFlowStage.Email;
  const isCoolingDown = isEmailStage && cooldownRemaining > 0;
  const hasEmailSentNotice = recoveryFlow?.ui.messages?.some(message => message.type === 'info') ?? false;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    // Cooldown only applies to the email-request stage. The code stage must be
    // free to submit the recovery code immediately, even if the cooldown is active.
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

  const instructions = isEmailStage ? (
    hasEmailSentNotice ? (
      <>
        <Divider sx={{ marginY: 1 }} />
        <Alert severity="info" variant="outlined">
          <Trans i18nKey="pages.recovery.message.resend" components={{ strong: <strong />, br: <br /> }} />
        </Alert>
      </>
    ) : (
      <Box fontSize={14} color="neutral.light">
        {t('pages.recovery.message.initial')}
      </Box>
    )
  ) : null;

  const submitLabelOverride = isCoolingDown
    ? (original: string | undefined) =>
        t('pages.recovery.cooldown.button', { label: original ?? '', seconds: cooldownRemaining })
    : undefined;

  return (
    <AuthenticationLayout>
      <AuthFormHeader title={t('pages.recovery.header')} />
      <KratosForm ui={recoveryFlow?.ui} onSubmit={handleSubmit}>
        <AuthPageContentContainer>
          <KratosUI
            ui={recoveryFlow?.ui}
            flowType="recovery"
            beforeInputs={instructions}
            submitDisabled={isCoolingDown}
            submitLabelOverride={submitLabelOverride}
          />
        </AuthPageContentContainer>
      </KratosForm>
    </AuthenticationLayout>
  );
};

export default RecoveryPage;
