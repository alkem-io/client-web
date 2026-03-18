import { useTranslation } from 'react-i18next';
import useKratosFlow, { FlowTypeName } from '@/core/auth/authentication/hooks/useKratosFlow';
import Loading from '@/core/ui/loading/Loading';
import { ErrorDisplay } from '@/domain/shared/components/ErrorDisplay';
import AuthPageContentContainer from '@/domain/shared/layout/AuthPageContentContainer';
import AuthenticationLayout from '../AuthenticationLayout';
import { AuthFormHeader } from '../components/AuthFormHeader';
import { KRATOS_REMOVED_FIELDS_DEFAULT, type KratosRemovedFieldAttributes } from '../components/Kratos/constants';
import KratosForm from '../components/Kratos/KratosForm';
import KratosUI from '../components/KratosUI';

const REMOVED_FIELDS: readonly KratosRemovedFieldAttributes[] = [
  ...KRATOS_REMOVED_FIELDS_DEFAULT,
  { name: 'traits.name.first' },
  { name: 'traits.name.last' },
  { name: 'traits.accepted_terms' },
  { type: 'submit', value: 'profile' },
  { name: 'traits.email' },
];

export const SettingsPage = ({ flow }: { flow: string }) => {
  const { t } = useTranslation();
  const { flow: settingsFlow, loading, error } = useKratosFlow(FlowTypeName.Settings, flow);

  if (loading) {
    return <Loading text={t('kratos.loading-flow')} />;
  }

  if (error) {
    return <ErrorDisplay />;
  }

  return (
    <AuthenticationLayout>
      <AuthFormHeader title={t('pages.settings.header')} hideMessage={true} />
      <KratosForm ui={settingsFlow?.ui}>
        <AuthPageContentContainer>
          <KratosUI ui={settingsFlow?.ui} removedFields={REMOVED_FIELDS} flowType="settings" />
        </AuthPageContentContainer>
      </KratosForm>
    </AuthenticationLayout>
  );
};

export default SettingsPage;
