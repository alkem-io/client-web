import { Box, Container } from '@mui/material';
import Grid from '@mui/material/Grid';
import React, { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import KratosUI from '../../components/Authentication/KratosUI';
import Loading from '../../components/core/Loading/Loading';
import Typography from '../../components/core/Typography';
import { useKratos } from '../../hooks';

interface RegisterPageProps {
  flow?: string;
}

export const VerificationPage: FC<RegisterPageProps> = ({ flow }) => {
  const { t } = useTranslation();
  const { verificationFlow, getVerificationFlow, loading } = useKratos();

  useEffect(() => {
    getVerificationFlow(flow);
  }, [getVerificationFlow, flow]);

  if (loading) return <Loading text={t('kratos.loading-flow')} />;

  return (
    <Container maxWidth="lg">
      <Grid container spacing={2} justifyContent={'center'}>
        <Grid item sm={4}>
          <Box marginY={3} textAlign={'center'}>
            <Typography variant={'h3'}>{t('pages.verification.header')}</Typography>
          </Box>
          <KratosUI flow={verificationFlow} />
        </Grid>
      </Grid>
    </Container>
  );
};
export default VerificationPage;
