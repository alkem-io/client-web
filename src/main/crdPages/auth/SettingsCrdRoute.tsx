import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { useTransactionScope } from '@/core/analytics/SentryTransactionScopeContext';
import useKratosFlow, { FlowTypeName } from '@/core/auth/authentication/hooks/useKratosFlow';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { useQueryParams } from '@/core/routing/useQueryParams';
import { SettingsCard } from '@/crd/components/auth/SettingsCard';
import { AuthShellWrapper } from './AuthShellWrapper';
import { flowDescriptorAdapter } from './flowDescriptorAdapter';
import { useTranslateDescriptor } from './useKratosMessageCopy';

/**
 * CRD `/settings` route — the un-gated replacement for the MUI `SettingsRoute`.
 * Kratos issues a settings flow after the user follows the password-recovery
 * link from their email; the user lands here to set a new password.
 */
export function SettingsCrdRoute() {
  useTransactionScope({ type: 'authentication' });
  const { t } = useTranslation();
  usePageTitle(t('pages.settings.header'));

  const params = useQueryParams();
  const flowId = params.get('flow') || undefined;

  // Mirrors the MUI `SettingsRoute` guard: settings flow requires a `flow`
  // query param (Kratos issues it after a recovery-link click). Without one,
  // bounce to the home route rather than silently asking Kratos to spin up a
  // brand-new settings flow against the current session.
  if (!flowId) {
    return <Navigate to="/" replace={true} />;
  }

  return <SettingsCrdPage flowId={flowId} />;
}

function SettingsCrdPage({ flowId }: { flowId: string }) {
  const { flow: settingsFlow, loading } = useKratosFlow(FlowTypeName.Settings, flowId);
  const translateDescriptor = useTranslateDescriptor();

  const baseDescriptor = settingsFlow ? flowDescriptorAdapter(settingsFlow, 'settings') : undefined;
  const descriptor = baseDescriptor ? translateDescriptor(baseDescriptor) : undefined;

  return (
    <AuthShellWrapper>
      <SettingsCard descriptor={descriptor} isLoading={loading} />
    </AuthShellWrapper>
  );
}
