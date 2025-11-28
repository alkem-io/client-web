import { useTranslation } from 'react-i18next';
import { Navigate, useLocation } from 'react-router-dom';
import { produce } from 'immer';
import { Card } from '@mui/material';
import KratosUI from '../components/KratosUI';
import Loading from '@/core/ui/loading/Loading';
import useKratosFlow, { FlowTypeName } from '@/core/auth/authentication/hooks/useKratosFlow';
import { _AUTH_LOGIN_PATH } from '../constants/authentication.constants';
import AuthPageContentContainer from '@/domain/shared/layout/AuthPageContentContainer';
import isAcceptTermsCheckbox from '../utils/isAcceptTermsCheckbox';
import AcceptTerms from './AcceptTerms';
import { ErrorDisplay } from '@/domain/shared/components/ErrorDisplay';
import { UiNode, UiText, UiNodeInputAttributes } from '@ory/kratos-client'; // Added UiNodeInputAttributes
import { LocationStateWithKratosErrors } from './LocationStateWithKratosErrors';
import KratosForm from '../components/Kratos/KratosForm';
import { isInputNode } from '../components/Kratos/helpers';
import AuthenticationLayout from '../AuthenticationLayout';
import { AuthFormHeader } from '../components/AuthFormHeader';

// TODO this hack is needed because Kratos resets traits.accepted_terms when the flow has failed to e.g. duplicate identifier

const MESSAGE_CODE_CLAIM_MISSING = 4000002;
const MESSAGE_CODE_ACCOUNT_EXIST_FOR_ID = 4000007;
const readHasAcceptedTermsFromStorage = (flowId: string | undefined) => {
  return typeof flowId === 'string' && sessionStorage.getItem(`kratosFlow:${flowId}:hasAcceptedTerms`) === 'true';
};

export const RegistrationPage = ({ flow }: { flow?: string }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { flow: registrationFlow, loading, error } = useKratosFlow(FlowTypeName.Registration, flow);

  const hasAcceptedTerms =
    (location.state as { hasAcceptedTerms: boolean } | null)?.hasAcceptedTerms ||
    readHasAcceptedTermsFromStorage(registrationFlow?.id);

  if (loading) return <Loading text={t('kratos.loading-flow')} />;

  const areTermsAccepted = (checkbox: UiNode) => (isInputNode(checkbox) ? checkbox.attributes.value : hasAcceptedTerms);

  const registrationFlowWithAcceptedTerms =
    registrationFlow &&
    produce(registrationFlow, nextFlow => {
      const termsCheckbox = nextFlow?.ui.nodes.find(isAcceptTermsCheckbox);
      if (termsCheckbox && isInputNode(termsCheckbox) && !termsCheckbox.attributes.value) {
        termsCheckbox.attributes.value = hasAcceptedTerms;
      }
    });

  const termsCheckbox = registrationFlowWithAcceptedTerms?.ui.nodes.find(isAcceptTermsCheckbox);

  // TODO this hack is needed because Kratos resets traits.accepted_terms when the flow has failed to e.g. duplicate identifier
  const storeHasAcceptedTerms = () => {
    if (registrationFlow?.id && termsCheckbox && isInputNode(termsCheckbox) && areTermsAccepted(termsCheckbox)) {
      sessionStorage.setItem(`kratosFlow:${registrationFlow.id}:hasAcceptedTerms`, 'true');
    }
  };

  // Find the specific "email claim missing" message from all nodes
  const emailClaimMissingMessageDetails = registrationFlow?.ui?.nodes
    ?.reduce((acc, node) => {
      if (node.messages) {
        acc.push(...node.messages);
      }
      return acc;
    }, [] as UiText[])
    .find(message => message.id === MESSAGE_CODE_CLAIM_MISSING && message.text === 'Property email is missing.');

  const hasEmailClaimMissingError = !!emailClaimMissingMessageDetails;

  const isViduaOidcFlow =
    registrationFlow?.active === 'oidc' &&
    registrationFlow?.ui?.nodes?.some(
      node =>
        node.group === 'oidc' &&
        node.type === 'input' && // Ensure it's an input node for provider
        (node.attributes as UiNodeInputAttributes).name === 'provider' &&
        (node.attributes as UiNodeInputAttributes).value === 'vidua'
    );

  // If an account with this identifier already exists (4000007)
  // navigate to the login page.
  if (registrationFlow?.ui.messages?.some(message => message.id === MESSAGE_CODE_ACCOUNT_EXIST_FOR_ID)) {
    const state: LocationStateWithKratosErrors = { kratosErrors: registrationFlow?.ui.messages };
    return <Navigate to={_AUTH_LOGIN_PATH} state={state} replace />;
  }
  // if the Vidua email is not verified (4000002) during a Vidua OIDC flow,
  // navigate to the login page.
  if (hasEmailClaimMissingError && isViduaOidcFlow) {
    // Pass only the specific email claim missing message
    const state: LocationStateWithKratosErrors = {
      kratosErrors: emailClaimMissingMessageDetails ? [emailClaimMissingMessageDetails] : [],
    };
    return <Navigate to={_AUTH_LOGIN_PATH} state={state} replace />;
  }

  if (loading) {
    return <Loading text={t('kratos.loading-flow')} />;
  }

  if (error) {
    return <ErrorDisplay />;
  }

  const mustAcceptTerms =
    termsCheckbox && isInputNode(termsCheckbox) ? !Boolean(termsCheckbox.attributes.value) : false;

  return (
    <AuthenticationLayout>
      <Card
        sx={{
          maxWidth: { xs: '100%', sm: '100%', md: '444px' },
          minWidth: '375px',
          marginTop: { xs: 1, sm: 1, md: 20 },
          height: 'fit-content',
        }}
      >
        <AuthFormHeader title={t('authentication.sign-up')} haveAccountMessage />
        <KratosForm ui={registrationFlow?.ui}>
          <AuthPageContentContainer>
            {mustAcceptTerms && <AcceptTerms ui={registrationFlow!.ui} />}
            {!mustAcceptTerms && (
              <KratosUI
                ui={registrationFlowWithAcceptedTerms?.ui}
                onBeforeSubmit={storeHasAcceptedTerms}
                acceptTermsComponent={AcceptTerms}
                flowType="registration"
              />
            )}
          </AuthPageContentContainer>
        </KratosForm>
      </Card>
    </AuthenticationLayout>
  );
};

export default RegistrationPage;
