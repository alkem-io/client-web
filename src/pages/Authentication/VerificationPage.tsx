import { VerificationFlow } from '@ory/kratos-client';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Grid from '@material-ui/core/Grid';
import { Box, Container } from '@material-ui/core';
import KratosUI from '../../components/Authentication/KratosUI';
import Loading from '../../components/core/Loading/Loading';
import Typography from '../../components/core/Typography';
import { useKratosClient } from '../../hooks';

interface RegisterPageProps {
  flow?: string;
}

export const VerificationPage: FC<RegisterPageProps> = ({ flow }) => {
  const [verificationFlow, setVerificationFlow] = useState<VerificationFlow>();
  const kratos = useKratosClient();
  const { t } = useTranslation();

  useEffect(() => {
    if (flow && kratos) {
      kratos
        .getSelfServiceVerificationFlow(flow)
        .then(({ status, data: flow, ..._response }) => {
          if (status !== 200) {
            console.error(flow);
          }
          setVerificationFlow(flow);
        })
        .catch(err => {
          const response = err && err.response;
          if (response) {
            if (response.status === 410) {
              window.location.replace(response.data.error.details.redirect_to);
            }
          }
        });
    }
  }, [flow]);

  if (!flow) {
    window.location.replace('/identity/ory/kratos/public/self-service/verification/browser');
    return null;
  }

  if (!verificationFlow) return <Loading text={'Loading flow'} />;

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
