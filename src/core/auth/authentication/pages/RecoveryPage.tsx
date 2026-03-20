import { Box } from '@mui/material';
import type { UiContainer } from '@ory/kratos-client/dist/api';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import useKratosFlow, { FlowTypeName } from '@/core/auth/authentication/hooks/useKratosFlow';
import Loading from '@/core/ui/loading/Loading';
import { ErrorDisplay } from '@/domain/shared/components/ErrorDisplay';
import AuthPageContentContainer from '@/domain/shared/layout/AuthPageContentContainer';
import AuthenticationLayout from '../AuthenticationLayout';
import { AuthFormHeader } from '../components/AuthFormHeader';
import { isInputNode } from '../components/Kratos/helpers';
import KratosForm from '../components/Kratos/KratosForm';
import KratosUI from '../components/KratosUI';

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
    <AuthenticationLayout>
      <AuthFormHeader title={t('pages.recovery.header')} />
      <KratosForm ui={recoveryFlow?.ui}>
        <AuthPageContentContainer>
          {flowStage === RecoveryFlowStage.Email && (
            <Box fontSize="14" color="neutral.light">
              {t('pages.recovery.message.initial')}
            </Box>
          )}
          <KratosUI ui={recoveryFlow?.ui} flowType="recovery" />
        </AuthPageContentContainer>
      </KratosForm>
    </AuthenticationLayout>
  );
};

export default RecoveryPage;
