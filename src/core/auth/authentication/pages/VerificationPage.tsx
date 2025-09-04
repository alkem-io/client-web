import { FC, MouseEventHandler, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import KratosUI from '../components/KratosUI';
import Loading from '@/core/ui/loading/Loading';
import useKratosFlow, { FlowTypeName } from '@/core/auth/authentication/hooks/useKratosFlow';
import { ErrorDisplay } from '@/domain/shared/components/ErrorDisplay';
import KratosForm from '../components/Kratos/KratosForm';
import AuthPageContentContainer from '@/domain/shared/layout/AuthPageContentContainer';
import { BlockTitle } from '@/core/ui/typography';
import { VerificationFlow } from '@ory/kratos-client';
import { useGetReturnUrl, useReturnUrl } from '../utils/useSignUpReturnUrl';
import { produce } from 'immer';
import { isAnchorNode, isVerificationContinueLink } from '../components/Kratos/helpers';
import AuthenticationLayout from '../AuthenticationLayout';
import { AuthFormHeader } from '../components/AuthFormHeader';

interface RegisterPageProps {
  flow?: string;
}

const hideVerificationMessage = (flow: VerificationFlow | undefined) =>
  (flow?.state === 'passed_challenge' || flow?.state === 'sent_email') ?? false;

export const VerificationPage: FC<RegisterPageProps> = ({ flow }) => {
  const { t } = useTranslation();
  const { flow: verificationFlow, loading, error } = useKratosFlow(FlowTypeName.Verification, flow);

  const { clearReturnUrl } = useReturnUrl();
  const returnUrl = useGetReturnUrl();

  const handleFormClick: MouseEventHandler = ({ target }) => {
    const element = target as HTMLElement;
    if (element.nodeName === 'A' && element.attributes['href'].value === returnUrl) {
      clearReturnUrl();
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
        if (isAnchorNode(continueButton)) {
          continueButton.attributes.href = verificationFlow.ui.action ?? returnUrl;
        }
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
    <AuthenticationLayout>
      <AuthFormHeader title={t('pages.verification.header')} hideMessage />
      <KratosForm ui={ui} onClick={handleFormClick}>
        <AuthPageContentContainer>
          {!hideVerificationMessage(verificationFlow) && <BlockTitle>{t('pages.verification.message')}</BlockTitle>}
          <KratosUI ui={ui} flowType="verification" />
        </AuthPageContentContainer>
      </KratosForm>
    </AuthenticationLayout>
  );
};

export default VerificationPage;
