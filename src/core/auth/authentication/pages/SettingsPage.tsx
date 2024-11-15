import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import KratosUI from '../components/KratosUI';
import Loading from '../../../ui/loading/Loading';
import useKratosFlow, { FlowTypeName } from '@/core/auth/authentication/hooks/useKratosFlow';
import { ErrorDisplay } from '@/domain/shared/components/ErrorDisplay';
import KratosForm from '../components/Kratos/KratosForm';
import AuthPageContentContainer from '@/domain/shared/layout/AuthPageContentContainer';
import FixedHeightLogo from '../components/FixedHeightLogo';
import { PageTitle } from '../../../ui/typography';
import { KRATOS_REMOVED_FIELDS_DEFAULT, KratosRemovedFieldAttributes } from '../components/Kratos/constants';

interface SettingsPageProps {
  flow: string;
}

const REMOVED_FIELDS: readonly KratosRemovedFieldAttributes[] = [
  ...KRATOS_REMOVED_FIELDS_DEFAULT,
  { name: 'traits.name.first' },
  { name: 'traits.name.last' },
  { name: 'traits.accepted_terms' },
  { type: 'submit', value: 'profile' },
  { name: 'traits.email' },
];

export const SettingsPage: FC<SettingsPageProps> = ({ flow }) => {
  const { t } = useTranslation();
  const { flow: settingsFlow, loading, error } = useKratosFlow(FlowTypeName.Settings, flow);

  if (loading) {
    return <Loading text={t('kratos.loading-flow')} />;
  }

  if (error) {
    return <ErrorDisplay />;
  }

  return (
    <KratosForm ui={settingsFlow?.ui}>
      <AuthPageContentContainer>
        <FixedHeightLogo />
        <PageTitle>{t('pages.settings.header')}</PageTitle>
        <KratosUI ui={settingsFlow?.ui} removedFields={REMOVED_FIELDS} />
      </AuthPageContentContainer>
    </KratosForm>
  );
};

export default SettingsPage;
