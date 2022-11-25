import { Box, Container } from '@mui/material';
import Grid from '@mui/material/Grid';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import KratosUI from '../components/KratosUI';
import Loading from '../../../../common/components/core/Loading/Loading';
import WrapperTypography from '../../../../common/components/core/WrapperTypography';
import useKratosFlow, { FlowTypeName } from '../../../../core/auth/authentication/hooks/useKratosFlow';
import { ErrorDisplay } from '../../../../domain/shared/components/ErrorDisplay';
import KratosForm from '../components/Kratos/KratosForm';

interface RegisterPageProps {
  flow?: string;
}

export const VerificationPage: FC<RegisterPageProps> = ({ flow }) => {
  const { t } = useTranslation();
  const { flow: verificationFlow, loading, error } = useKratosFlow(FlowTypeName.Verification, flow);

  if (loading) {
    return <Loading text={t('kratos.loading-flow')} />;
  }

  if (error) {
    return <ErrorDisplay />;
  }

  return (
    <KratosForm ui={verificationFlow?.ui}>
      <Container maxWidth="lg">
        <Grid container spacing={2} justifyContent={'center'}>
          <Grid item sm={4}>
            <Box marginY={3} textAlign={'center'}>
              <WrapperTypography variant={'h3'}>{t('pages.verification.header')}</WrapperTypography>
            </Box>
            <Box marginY={3} textAlign={'center'}>
              <WrapperTypography variant={'h5'}>{t('pages.verification.message')}</WrapperTypography>
            </Box>
            <KratosUI ui={verificationFlow?.ui} />
          </Grid>
        </Grid>
      </Container>
    </KratosForm>
  );
};
export default VerificationPage;
