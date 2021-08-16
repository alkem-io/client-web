import { SettingsFlow } from '@ory/kratos-client';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Grid from '@material-ui/core/Grid';
import { Box, Container } from '@material-ui/core';
import KratosUI from '../../components/Authentication/KratosUI';
import Loading from '../../components/core/Loading/Loading';
import Typography from '../../components/core/Typography';
import { useKratosClient } from '../../hooks';

interface RegisterPageProps {
  flow: string;
}

export const SettingsPage: FC<RegisterPageProps> = ({ flow }) => {
  const [settingsFlow, setSettingsFlow] = useState<SettingsFlow>();
  const kratos = useKratosClient();

  const hideFields = useMemo(
    () => ['traits.name.first', 'traits.name.last', 'traits.accepted_terms', 'profile', 'traits.email'],
    []
  );
  const { t } = useTranslation();

  useEffect(() => {
    if (flow && kratos) {
      kratos
        .getSelfServiceSettingsFlow(flow)
        .then(({ status, data: flow, ..._response }) => {
          if (status !== 200) {
            console.error(flow);
          }
          setSettingsFlow(flow);
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

  if (!settingsFlow) return <Loading text={'Loading flow'} />;

  return (
    <Container maxWidth="lg">
      <Grid container spacing={2} justifyContent={'center'}>
        <Grid item sm={4}>
          <Box marginY={3} textAlign={'center'}>
            <Typography variant={'h3'}>{t('pages.settings.header')}</Typography>
          </Box>
          <KratosUI flow={settingsFlow} hideFields={hideFields} />
        </Grid>
      </Grid>
    </Container>
  );
};
export default SettingsPage;
