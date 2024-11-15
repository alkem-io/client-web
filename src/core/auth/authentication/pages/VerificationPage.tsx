import React, { FC, MouseEventHandler, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import KratosUI from '../components/KratosUI';
import Loading from '../../../ui/loading/Loading';
import useKratosFlow, { FlowTypeName } from '@/core/auth/authentication/hooks/useKratosFlow';
import { ErrorDisplay } from '@/domain/shared/components/ErrorDisplay';
import KratosForm from '../components/Kratos/KratosForm';
import AuthPageContentContainer from '@/domain/shared/layout/AuthPageContentContainer';
import FixedHeightLogo from '../components/FixedHeightLogo';
import { BlockTitle, PageTitle } from '../../../ui/typography';
import { SelfServiceVerificationFlow } from '@ory/kratos-client';
import { useSignUpReturnUrl } from '../utils/SignUpReturnUrl';
import produce from 'immer';
import { isAnchorNode, isVerificationContinueLink } from '../components/Kratos/helpers';
import { UiNodeAnchor } from '../components/Kratos/UiNodeTypes';

interface RegisterPageProps {
  flow?: string;
}

const hideVerificationMessage = (flow: SelfServiceVerificationFlow | undefined) =>
  (flow?.state === 'passed_challenge' || flow?.state === 'sent_email') ?? false;

export const VerificationPage: FC<RegisterPageProps> = ({ flow }) => {
  const { t } = useTranslation();
  const { flow: verificationFlow, loading, error } = useKratosFlow(FlowTypeName.Verification, flow);

  const [returnUrl, cleanUp] = useSignUpReturnUrl();

  const handleFormClick: MouseEventHandler = ({ target }) => {
    const element = target as HTMLElement;
    if (element.nodeName === 'A' && element.attributes['href'].value === returnUrl) {
      cleanUp();
    }
  };

  const ui = useMemo(() => {
    return (
      verificationFlow?.ui &&
      produce(verificationFlow.ui, nextUi => {
        const continueButton = nextUi.nodes.find(node => isAnchorNode(node) && isVerificationContinueLink(node));
        if (!continueButton) {
          return;
        }
        (continueButton as UiNodeAnchor).attributes.href = verificationFlow.ui.action ?? returnUrl;
      })
    );
  }, [verificationFlow]);

  if (loading) {
    return <Loading text={t('kratos.loading-flow')} />;
  }

  if (error) {
    return <ErrorDisplay />;
  }

  return (
    <KratosForm ui={ui} onClick={handleFormClick}>
      <AuthPageContentContainer>
        <FixedHeightLogo />
        <PageTitle>{t('pages.verification.header')}</PageTitle>
        {!hideVerificationMessage(verificationFlow) && <BlockTitle>{t('pages.verification.message')}</BlockTitle>}
        <KratosUI ui={ui} />
      </AuthPageContentContainer>
    </KratosForm>
  );
};

export default VerificationPage;
