import { useTranslation } from 'react-i18next';
import { useTransactionScope } from '@/core/analytics/SentryTransactionScopeContext';
import { AUTH_SIGN_UP_PATH } from '@/core/auth/authentication/constants/authentication.constants';
import useKratosFlow, { FlowTypeName } from '@/core/auth/authentication/hooks/useKratosFlow';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { useQueryParams } from '@/core/routing/useQueryParams';
import { RecoveryCard } from '@/crd/components/auth/RecoveryCard';
import { AuthShellWrapper } from './AuthShellWrapper';
import { flowDescriptorAdapter } from './flowDescriptorAdapter';
import { useKratosMessageCopy } from './useKratosMessageCopy';

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
  const translateMessages = useKratosMessageCopy();

  const baseDescriptor = recoveryFlow ? flowDescriptorAdapter(recoveryFlow, 'recovery') : undefined;
  const descriptor = baseDescriptor
    ? { ...baseDescriptor, messages: translateMessages(baseDescriptor.messages) }
    : undefined;

  return (
    <AuthShellWrapper>
      <RecoveryCard descriptor={descriptor} isLoading={loading} signUpHref={AUTH_SIGN_UP_PATH} />
    </AuthShellWrapper>
  );
}
