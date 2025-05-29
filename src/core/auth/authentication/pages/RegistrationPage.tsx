import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { produce } from 'immer';
import KratosUI from '../components/KratosUI';
import Loading from '@/core/ui/loading/Loading';
import useKratosFlow, { FlowTypeName } from '@/core/auth/authentication/hooks/useKratosFlow';
import { _AUTH_LOGIN_PATH } from '../constants/authentication.constants';
import AuthPageContentContainer from '@/domain/shared/layout/AuthPageContentContainer';
import isAcceptTermsCheckbox from '../utils/isAcceptTermsCheckbox';
import AcceptTerms from './AcceptTerms';
import { ErrorDisplay } from '@/domain/shared/components/ErrorDisplay';
import { UiNode } from '@ory/kratos-client';
import { LocationStateWithKratosErrors } from './LocationStateWithKratosErrors';
import KratosForm from '../components/Kratos/KratosForm';
import { isInputNode } from '../components/Kratos/helpers';
import AuthenticationLayout from '../AuthenticationLayout';
import { AuthFormHeader } from '../components/AuthFormHeader';

// TODO this hack is needed because Kratos resets traits.accepted_terms when the flow has failed to e.g. duplicate identifier

const MESSAGE_CODE_ACCOUNT_EXIST_FOR_ID = 4000007;

export const RegistrationPage = ({ flow }: { flow?: string }) => {
  const { t } = useTranslation();
  const { flow: registrationFlow, loading, error } = useKratosFlow(FlowTypeName.Registration, flow);

  const hasAcceptedTerms = true;
  // (location.state as { hasAcceptedTerms: boolean } | null)?.hasAcceptedTerms ||
  // readHasAcceptedTermsFromStorage(registrationFlow?.id);

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

  if (registrationFlow?.ui.messages?.some(message => message.id === MESSAGE_CODE_ACCOUNT_EXIST_FOR_ID)) {
    const state: LocationStateWithKratosErrors = { kratosErrors: registrationFlow?.ui.messages };
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
      <AuthFormHeader title={t('authentication.sign-up')} haveAccountMessage />
      <KratosForm ui={registrationFlow?.ui}>
        <AuthPageContentContainer>
          {!mustAcceptTerms && (
            <>
              <KratosUI
                ui={registrationFlowWithAcceptedTerms?.ui}
                onBeforeSubmit={storeHasAcceptedTerms}
                acceptTermsComponent={AcceptTerms}
              />
            </>
          )}
        </AuthPageContentContainer>
      </KratosForm>
    </AuthenticationLayout>
  );
};

export default RegistrationPage;
