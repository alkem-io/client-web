import { Box, Container } from '@mui/material';
import Grid from '@mui/material/Grid';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import KratosUI from '../components/KratosUI';
import Loading from '../../../../common/components/core/Loading/Loading';
import WrapperTypography from '../../../../common/components/core/WrapperTypography';
import useKratosFlow, { FlowTypeName } from '../../../../core/auth/authentication/hooks/useKratosFlow';
import { ErrorDisplay } from '../../../../domain/shared/components/ErrorDisplay';
import KratosForm from '../components/Kratos/KratosForm';

interface RegisterPageProps {
  flow: string;
}

export const SettingsPage: FC<RegisterPageProps> = ({ flow }) => {
  const { t } = useTranslation();
  const { flow: settingsFlow, loading, error } = useKratosFlow(FlowTypeName.Settings, flow);

  const hideFields = useMemo(
    () => ['traits.name.first', 'traits.name.last', 'traits.accepted_terms', 'profile', 'traits.email'],
    []
  );

  if (loading) {
    return <Loading text={t('kratos.loading-flow')} />;
  }

  if (error) {
    return <ErrorDisplay />;
  }

  return (
    <KratosForm ui={settingsFlow?.ui}>
      <Container maxWidth="lg">
        <Grid container spacing={2} justifyContent={'center'}>
          <Grid item sm={4}>
            <Box marginY={3} textAlign={'center'}>
              <WrapperTypography variant={'h3'}>{t('pages.settings.header')}</WrapperTypography>
            </Box>
            <KratosUI ui={settingsFlow?.ui} hideFields={hideFields} />
          </Grid>
        </Grid>
      </Container>
    </KratosForm>
  );
};

export default SettingsPage;
