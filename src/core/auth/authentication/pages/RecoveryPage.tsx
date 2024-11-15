import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import KratosUI from '../components/KratosUI';
import Loading from '../../../ui/loading/Loading';
import useKratosFlow, { FlowTypeName } from '@/core/auth/authentication/hooks/useKratosFlow';
import { ErrorDisplay } from '@/domain/shared/components/ErrorDisplay';
import KratosForm from '../components/Kratos/KratosForm';
import AuthPageContentContainer from '@/domain/shared/layout/AuthPageContentContainer';
import FixedHeightLogo from '../components/FixedHeightLogo';
import { PageTitle, BlockTitle } from '../../../ui/typography';
import { isInputNode } from '../components/Kratos/helpers';
import { UiContainer } from '@ory/kratos-client/dist/api';

interface RegisterPageProps {
  flow: string;
}

enum RecoveryFlowStage {
  Email = 'email',
  Code = 'code',
}

const hasCodeInput = (ui: UiContainer) =>
  ui.nodes.some(node => isInputNode(node) && node.attributes.node_type === 'input' && node.attributes.name === 'code');

export const RecoveryPage: FC<RegisterPageProps> = ({ flow }) => {
  const { t } = useTranslation();
  const { flow: recoveryFlow, loading, error } = useKratosFlow(FlowTypeName.Recovery, flow);

  if (loading) {
    return <Loading text={t('kratos.loading-flow')} />;
  }

  if (error) {
    return <ErrorDisplay />;
  }

  const flowStage = recoveryFlow && (hasCodeInput(recoveryFlow.ui) ? RecoveryFlowStage.Code : RecoveryFlowStage.Email);

  return (
    <KratosForm ui={recoveryFlow?.ui}>
      <AuthPageContentContainer>
        <FixedHeightLogo />
        <PageTitle>{t('pages.recovery.header')}</PageTitle>
        {flowStage === RecoveryFlowStage.Email && <BlockTitle>{t('pages.recovery.message.initial')}</BlockTitle>}
        <KratosUI ui={recoveryFlow?.ui} />
      </AuthPageContentContainer>
    </KratosForm>
  );
};

export default RecoveryPage;
