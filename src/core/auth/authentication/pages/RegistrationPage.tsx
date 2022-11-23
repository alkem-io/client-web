import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import produce from 'immer';
import KratosUI from '../components/KratosUI';
import Loading from '../../../../common/components/core/Loading/Loading';
import useKratosFlow, { FlowTypeName } from '../../../../core/auth/authentication/hooks/useKratosFlow';
import { AUTH_LOGIN_PATH } from '../../../../models/constants';
import Container from '../../../../domain/shared/layout/Container';
import { sxCols } from '../../../../domain/shared/layout/Grid';
import FixedHeightLogo from '../components/FixedHeightLogo';
import SubHeading from '../../../../domain/shared/components/Text/SubHeading';
import Paragraph from '../../../../domain/shared/components/Text/Paragraph';
import isAcceptTermsCheckbox from '../utils/isAcceptTermsCheckbox';
import AcceptTerms from './AcceptTerms';
import { ErrorDisplay } from '../../../../domain/shared/components/ErrorDisplay';
import { UiNodeInput } from '../components/UiNodeInput';

interface RegisterPageProps {
  flow?: string;
}

// TODO this hack is needed because Kratos resets traits.accepted_terms when the flow has failed to e.g. duplicate identifier
const readHasAcceptedTermsFromStorage = (flowId: string | undefined) => {
  return typeof flowId === 'string' && sessionStorage.getItem(`kratosFlow:${flowId}:hasAcceptedTerms`) === 'true';
};

export const RegistrationPage: FC<RegisterPageProps> = ({ flow }) => {
  const { t } = useTranslation();
  const { flow: registrationFlow, loading, error } = useKratosFlow(FlowTypeName.Registration, flow);

  const location = useLocation();

  const hasAcceptedTerms =
    (location.state as { hasAcceptedTerms: boolean } | null)?.hasAcceptedTerms ||
    readHasAcceptedTermsFromStorage(registrationFlow?.id);

  if (loading) return <Loading text={t('kratos.loading-flow')} />;

  const termsCheckbox = registrationFlow?.ui.nodes.find(isAcceptTermsCheckbox) as UiNodeInput | undefined;

  const areTermsAccepted = (checkbox: UiNodeInput) => checkbox.attributes.value || hasAcceptedTerms;

  const registrationFlowWithAcceptedTerms =
    registrationFlow &&
    produce(registrationFlow, nextFlow => {
      const termsCheckbox = nextFlow?.ui.nodes.find(isAcceptTermsCheckbox) as UiNodeInput | undefined;
      if (termsCheckbox && !termsCheckbox.attributes.value) {
        termsCheckbox.attributes.value = hasAcceptedTerms;
      }
    });

  // TODO this hack is needed because Kratos resets traits.accepted_terms when the flow has failed to e.g. duplicate identifier
  const storeHasAcceptedTerms = () => {
    if (registrationFlow?.id && termsCheckbox && areTermsAccepted(termsCheckbox)) {
      sessionStorage.setItem(`kratosFlow:${registrationFlow.id}:hasAcceptedTerms`, 'true');
    }
  };

  if (loading) {
    return <Loading text={t('kratos.loading-flow')} />;
  }

  if (error) {
    return <ErrorDisplay />;
  }

  return (
    <Container marginTop={9} maxWidth={sxCols(7)} gap={4}>
      <FixedHeightLogo />
      <SubHeading>{t('pages.registration.header')}</SubHeading>
      <KratosUI
        flow={registrationFlowWithAcceptedTerms}
        onBeforeSubmit={storeHasAcceptedTerms}
        acceptTermsComponent={AcceptTerms}
        hideFields={['traits.picture']}
      />
      <Paragraph textAlign="center" marginTop={5}>
        {t('pages.registration.login')} <Link to={AUTH_LOGIN_PATH}>{t('authentication.sign-in')}</Link>
      </Paragraph>
    </Container>
  );
};

export default RegistrationPage;
