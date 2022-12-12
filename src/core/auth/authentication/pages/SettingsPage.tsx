import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import KratosUI from '../components/KratosUI';
import Loading from '../../../../common/components/core/Loading/Loading';
import useKratosFlow, { FlowTypeName } from '../../../../core/auth/authentication/hooks/useKratosFlow';
import { ErrorDisplay } from '../../../../domain/shared/components/ErrorDisplay';
import KratosForm from '../components/Kratos/KratosForm';
import Container from '../../../../domain/shared/layout/Container';
import { sxCols } from '../../../../domain/shared/layout/Grid';
import FixedHeightLogo from '../components/FixedHeightLogo';
import { PageTitle } from '../../../ui/typography';

interface SettingsPageProps {
  flow: string;
}

export const SettingsPage: FC<SettingsPageProps> = ({ flow }) => {
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
      <Container marginTop={9} maxWidth={sxCols(7)} gap={4}>
        <FixedHeightLogo />
        <PageTitle>{t('pages.settings.header')}</PageTitle>
        <KratosUI ui={settingsFlow?.ui} hideFields={hideFields} />
      </Container>
    </KratosForm>
  );
};

export default SettingsPage;
