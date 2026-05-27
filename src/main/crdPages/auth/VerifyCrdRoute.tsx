import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';
import { useTransactionScope } from '@/core/analytics/SentryTransactionScopeContext';
import useKratosFlow, { FlowTypeName } from '@/core/auth/authentication/hooks/useKratosFlow';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { useQueryParams } from '@/core/routing/useQueryParams';
import { VerificationCard } from '@/crd/components/auth/VerificationCard';
import { buildLoginUrl } from '@/main/routing/urlBuilders';
import { AuthShellWrapper } from './AuthShellWrapper';
import { CrdEmailVerificationRequiredPage } from './CrdEmailVerificationRequiredPage';
import { flowDescriptorAdapter } from './flowDescriptorAdapter';
import { useTranslateDescriptor } from './useKratosMessageCopy';

/** `/verify` — the email-verification Kratos flow. */
function CrdVerificationPage() {
  useTransactionScope({ type: 'authentication' });
  const { t } = useTranslation();
  usePageTitle(t('pages.verification.header'));

  const flowId = useQueryParams().get('flow') || undefined;
  const { flow: verificationFlow, loading } = useKratosFlow(FlowTypeName.Verification, flowId);
  const translateDescriptor = useTranslateDescriptor();

  const baseDescriptor = verificationFlow ? flowDescriptorAdapter(verificationFlow, 'verification') : undefined;
  const translatedDescriptor = baseDescriptor ? translateDescriptor(baseDescriptor) : undefined;

  // Relabel the surviving link-method submit to a clearer
  // "Resend verification email". The adapter already dropped the code-method
  // duplicate; this is the i18n-aware step the adapter can't do itself.
  const descriptor = translatedDescriptor
    ? {
        ...translatedDescriptor,
        groups: {
          ...translatedDescriptor.groups,
          submit: translatedDescriptor.groups.submit.map(node => ({
            ...node,
            label: t('pages.verification.resendEmail'),
          })),
        },
      }
    : undefined;

  return (
    <AuthShellWrapper>
      <VerificationCard descriptor={descriptor} isLoading={loading} signInHref={buildLoginUrl()} />
    </AuthShellWrapper>
  );
}

/** CRD `/verify/*` route — the un-gated replacement for the MUI `VerifyRoute`. */
export function VerifyCrdRoute() {
  return (
    <Routes>
      <Route path="/" element={<CrdVerificationPage />} />
      <Route
        path="reminder"
        element={<CrdEmailVerificationRequiredPage pageTitleKey="pages.verification-required.header" />}
      />
    </Routes>
  );
}
