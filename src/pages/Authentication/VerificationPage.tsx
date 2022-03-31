import { Box, Container } from '@mui/material';
import Grid from '@mui/material/Grid';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import KratosUI from '../../components/Authentication/KratosUI';
import Loading from '../../components/core/Loading/Loading';
import Typography from '../../components/core/Typography';
import useKratosFlow, { FlowTypeName } from '../../hooks/kratos/useKratosFlow';

interface RegisterPageProps {
  flow?: string;
}

export const VerificationPage: FC<RegisterPageProps> = ({ flow }) => {
  const { t } = useTranslation();
  const { flow: verificationFlow, loading } = useKratosFlow(FlowTypeName.Verification, flow);

  if (loading) return <Loading text={t('kratos.loading-flow')} />;

  return (
    <Container maxWidth="lg">
      <Grid container spacing={2} justifyContent={'center'}>
        <Grid item sm={4}>
          <Box marginY={3} textAlign={'center'}>
            <Typography variant={'h3'}>{t('pages.verification.header')}</Typography>
          </Box>
          <Box marginY={3} textAlign={'center'}>
            <Typography variant={'h5'}>{t('pages.verification.message')}</Typography>
          </Box>
          <KratosUI flow={verificationFlow} />
        </Grid>
      </Grid>
    </Container>
  );
};
export default VerificationPage;
