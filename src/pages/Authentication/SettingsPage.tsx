import { Box, Container } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import React, { FC, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import KratosUI from '../../components/Authentication/KratosUI';
import Loading from '../../components/core/Loading/Loading';
import Typography from '../../components/core/Typography';
import { useKratos } from '../../hooks';

interface RegisterPageProps {
  flow: string;
}

export const SettingsPage: FC<RegisterPageProps> = ({ flow }) => {
  const { t } = useTranslation();
  const { settingsFlow, getSettingsFlow, loading } = useKratos();

  const hideFields = useMemo(
    () => ['traits.name.first', 'traits.name.last', 'traits.accepted_terms', 'profile', 'traits.email'],
    []
  );

  useEffect(() => {
    getSettingsFlow(flow);
  }, [getSettingsFlow, flow]);

  if (loading) return <Loading text={t('kratos.loading-flow')} />;

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
