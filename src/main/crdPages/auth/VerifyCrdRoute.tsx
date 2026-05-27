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

  // Verification's sent_email state exposes two distinct submits: the link
  // method (name="method", value="link", label "Continue") and the code method
  // (name="email", value=<address>, label "Resend code"). Both functionally just
  // re-send a verification email, so we keep only the link-method submit and
  // relabel it for clarity — one "Resend verification email" button is enough.
  const descriptor = translatedDescriptor
    ? {
        ...translatedDescriptor,
        groups: {
          ...translatedDescriptor.groups,
          submit: translatedDescriptor.groups.submit
            .filter(node => node.name === 'method')
            .map(node => ({ ...node, label: t('pages.verification.resendEmail') })),
        },
      }
    : undefined;

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
