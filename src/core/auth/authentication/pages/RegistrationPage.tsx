import { useTranslation } from 'react-i18next';
import { Link, Navigate, useLocation } from 'react-router-dom';
import produce from 'immer';
import KratosUI from '../components/KratosUI';
import Loading from '@/core/ui/loading/Loading';
import useKratosFlow, { FlowTypeName } from '@/core/auth/authentication/hooks/useKratosFlow';
import { _AUTH_LOGIN_PATH } from '../constants/authentication.constants';
import AuthPageContentContainer from '@/domain/shared/layout/AuthPageContentContainer';
import FixedHeightLogo from '../components/FixedHeightLogo';
import SubHeading from '@/domain/shared/components/Text/SubHeading';
import Paragraph from '@/domain/shared/components/Text/Paragraph';
import isAcceptTermsCheckbox from '../utils/isAcceptTermsCheckbox';
import AcceptTerms from './AcceptTerms';
import { ErrorDisplay } from '@/domain/shared/components/ErrorDisplay';
import { UiNodeInput } from '../components/Kratos/UiNodeTypes';
import { LocationStateWithKratosErrors } from './LocationStateWithKratosErrors';
import KratosForm from '../components/Kratos/KratosForm';

// TODO this hack is needed because Kratos resets traits.accepted_terms when the flow has failed to e.g. duplicate identifier
const readHasAcceptedTermsFromStorage = (flowId: string | undefined) => {
  return typeof flowId === 'string' && sessionStorage.getItem(`kratosFlow:${flowId}:hasAcceptedTerms`) === 'true';
};

const MESSAGE_CODE_ACCOUNT_EXIST_FOR_ID = 4000007;

export const RegistrationPage = ({ flow }: { flow?: string }) => {
  const { t } = useTranslation();
  const { flow: registrationFlow, loading, error } = useKratosFlow(FlowTypeName.Registration, flow);

  const location = useLocation();

  const hasAcceptedTerms =
    (location.state as { hasAcceptedTerms: boolean } | null)?.hasAcceptedTerms ||
    readHasAcceptedTermsFromStorage(registrationFlow?.id);

  if (loading) return <Loading text={t('kratos.loading-flow')} />;

  const areTermsAccepted = (checkbox: UiNodeInput) => checkbox.attributes.value || hasAcceptedTerms;

  const registrationFlowWithAcceptedTerms =
    registrationFlow &&
    produce(registrationFlow, nextFlow => {
      const termsCheckbox = nextFlow?.ui.nodes.find(isAcceptTermsCheckbox) as UiNodeInput | undefined;
      if (termsCheckbox && !termsCheckbox.attributes.value) {
        termsCheckbox.attributes.value = hasAcceptedTerms;
      }
    });

  const termsCheckbox = registrationFlowWithAcceptedTerms?.ui.nodes.find(isAcceptTermsCheckbox) as
    | UiNodeInput
    | undefined;

  // TODO this hack is needed because Kratos resets traits.accepted_terms when the flow has failed to e.g. duplicate identifier
  const storeHasAcceptedTerms = () => {
    if (registrationFlow?.id && termsCheckbox && areTermsAccepted(termsCheckbox)) {
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

  const mustAcceptTerms = termsCheckbox ? !termsCheckbox.attributes.value : false;

  return (
    <KratosForm ui={registrationFlow?.ui}>
      <AuthPageContentContainer>
        <FixedHeightLogo />
        {mustAcceptTerms && <AcceptTerms ui={registrationFlow!.ui} />}
        {!mustAcceptTerms && (
          <>
            <SubHeading textAlign="center">{t('pages.registration.header')}</SubHeading>
            <KratosUI
              ui={registrationFlowWithAcceptedTerms?.ui}
              onBeforeSubmit={storeHasAcceptedTerms}
              acceptTermsComponent={AcceptTerms}
            />
          </>
        )}
        <Paragraph textAlign="center" marginTop={5}>
          {t('pages.registration.login')} <Link to={_AUTH_LOGIN_PATH}>{t('authentication.sign-in')}</Link>
        </Paragraph>
      </AuthPageContentContainer>
    </KratosForm>
  );
};

export default RegistrationPage;
