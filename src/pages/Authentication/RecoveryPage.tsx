import { Box, Container } from '@mui/material';
import Grid from '@mui/material/Grid';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import KratosUI from '../../components/Authentication/KratosUI';
import Loading from '../../components/core/Loading/Loading';
import Typography from '../../components/core/Typography';
import useKratosFlow, { FlowTypeName } from '../../hooks/kratos/useKratosFlow';

interface RegisterPageProps {
  flow: string;
}

export const RecoveryPage: FC<RegisterPageProps> = ({ flow }) => {
  const { t } = useTranslation();
  const { flow: recoveryFlow, loading } = useKratosFlow(FlowTypeName.Recovery, flow);

  if (loading) return <Loading text={t('kratos.loading-flow')} />;

  return (
    <Container maxWidth="lg">
      <Grid container spacing={2} justifyContent={'center'}>
        <Grid item sm={4}>
          <Box marginY={3} textAlign={'center'}>
            <Typography variant={'h3'}>{t('pages.recovery.header')}</Typography>
          </Box>
          <Box marginY={3} textAlign={'center'}>
            <Typography variant={'h5'}>{t('pages.recovery.message')}</Typography>
          </Box>
          <KratosUI flow={recoveryFlow} />
        </Grid>
      </Grid>
    </Container>
  );
};
export default RecoveryPage;
