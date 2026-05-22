import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';
import { useTransactionScope } from '@/core/analytics/SentryTransactionScopeContext';
import useKratosFlow, { FlowTypeName } from '@/core/auth/authentication/hooks/useKratosFlow';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { useQueryParams } from '@/core/routing/useQueryParams';
import { EmailVerificationRequiredCard } from '@/crd/components/auth/EmailVerificationRequiredCard';
import { VerificationCard } from '@/crd/components/auth/VerificationCard';
import { buildLoginUrl } from '@/main/routing/urlBuilders';
import { AuthShellWrapper } from './AuthShellWrapper';
import { flowDescriptorAdapter } from './flowDescriptorAdapter';

/** `/verify` — the email-verification Kratos flow. */
function CrdVerificationPage() {
  useTransactionScope({ type: 'authentication' });
  const { t } = useTranslation();
  usePageTitle(t('pages.verification.header'));

  const flowId = useQueryParams().get('flow') || undefined;
  const { flow: verificationFlow, loading } = useKratosFlow(FlowTypeName.Verification, flowId);
  const descriptor = verificationFlow ? flowDescriptorAdapter(verificationFlow, 'verification') : undefined;

  return (
    <AuthShellWrapper>
      <VerificationCard descriptor={descriptor} isLoading={loading} signInHref={buildLoginUrl()} />
    </AuthShellWrapper>
  );
}

/** `/verify/reminder` — the "please verify your email" reminder. */
function CrdEmailVerificationRequiredPage() {
  useTransactionScope({ type: 'authentication' });
  const { t } = useTranslation();
  usePageTitle(t('pages.verification-required.header'));

  return (
    <AuthShellWrapper>
      <EmailVerificationRequiredCard signInHref={buildLoginUrl()} />
    </AuthShellWrapper>
  );
}

/** CRD `/verify/*` route — the un-gated replacement for the MUI `VerifyRoute`. */
export function VerifyCrdRoute() {
  return (
    <Routes>
      <Route path="/" element={<CrdVerificationPage />} />
      <Route path="reminder" element={<CrdEmailVerificationRequiredPage />} />
    </Routes>
  );
}
