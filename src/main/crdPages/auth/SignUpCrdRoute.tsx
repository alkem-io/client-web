import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';
import { useTransactionScope } from '@/core/analytics/SentryTransactionScopeContext';
import useKratosFlow, { FlowTypeName } from '@/core/auth/authentication/hooks/useKratosFlow';
import usePasskeyScript from '@/core/auth/authentication/hooks/usePasskeyScript';
import { NotAuthenticatedRoute } from '@/core/routing/NotAuthenticatedRoute';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { useQueryParams } from '@/core/routing/useQueryParams';
import { SignUpCard } from '@/crd/components/auth/SignUpCard';
import { useConfig } from '@/domain/platform/config/useConfig';
import { buildLoginUrl } from '@/main/routing/urlBuilders';
import { AuthShellWrapper } from './AuthShellWrapper';
import { CrdEmailVerificationRequiredPage } from './CrdEmailVerificationRequiredPage';
import { flowDescriptorAdapter } from './flowDescriptorAdapter';
import { invokePasskeyTrigger } from './passkeyTrigger';
import { useTranslateDescriptor } from './useKratosMessageCopy';

/**
 * Shared sign-up page logic. Drives the Kratos registration flow and persists
 * the accept-terms checkbox per flow id, because Kratos resets that trait on a
 * validation-error re-render (mirrors the MUI `RegistrationPage` workaround).
 */
function CrdSignUpPage() {
  useTransactionScope({ type: 'authentication' });
  const { t } = useTranslation();
  usePageTitle(t('pages.titles.signUp'));

  const params = useQueryParams();
  const flowId = params.get('flow') || undefined;
  const { flow: registrationFlow, loading } = useKratosFlow(FlowTypeName.Registration, flowId);
  const { locations } = useConfig();
  const translateDescriptor = useTranslateDescriptor();
  usePasskeyScript(registrationFlow?.ui?.nodes);

  const [accepted, setAccepted] = useState(false);
  const storageKey = registrationFlow ? `crd-auth-accepted-terms-${registrationFlow.id}` : undefined;

  useEffect(() => {
    if (storageKey) {
      setAccepted(sessionStorage.getItem(storageKey) === 'true');
    }
  }, [storageKey]);

  const handleAcceptedChange = (value: boolean) => {
    setAccepted(value);
    if (storageKey) {
      sessionStorage.setItem(storageKey, String(value));
    }
  };

  const baseDescriptor = registrationFlow ? flowDescriptorAdapter(registrationFlow, 'registration') : undefined;
  const descriptor = baseDescriptor ? translateDescriptor(baseDescriptor) : undefined;

  return (
    <AuthShellWrapper>
      <SignUpCard
        descriptor={descriptor}
        isLoading={loading}
        signInHref={buildLoginUrl()}
        termsOfUseHref={locations?.terms ?? '#'}
        privacyPolicyHref={locations?.privacy ?? '#'}
        hasAcceptedTerms={accepted}
        onAcceptedTermsChange={handleAcceptedChange}
        onPasskeyTrigger={trigger => {
          invokePasskeyTrigger(trigger).catch(() => {
            /* passkey errors are surfaced inline once passkey is wired for registration */
          });
        }}
      />
    </AuthShellWrapper>
  );
}

/** CRD `/sign_up` route — the curated quick-registration entry point. */
export function SignUpCrdRoute() {
  return <CrdSignUpPage />;
}

/** CRD `/registration` route — the full Kratos registration flow + success handler. */
export function RegistrationCrdRoute() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <NotAuthenticatedRoute>
            <CrdSignUpPage />
          </NotAuthenticatedRoute>
        }
      />
      <Route path="success" element={<CrdEmailVerificationRequiredPage pageTitleKey="pages.titles.signUp" />} />
    </Routes>
  );
}
