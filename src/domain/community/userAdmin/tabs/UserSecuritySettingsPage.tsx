import { FormEvent, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import UserAdminLayout from '@/domain/community/userAdmin/layout/UserAdminLayout';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContent from '@/core/ui/content/PageContent';
import { BlockTitle } from '@/core/ui/typography/components';
import Loading from '@/core/ui/loading/Loading';
import { ErrorDisplay } from '@/domain/shared/components/ErrorDisplay';
import useKratosFlow, { FlowTypeName } from '@/core/auth/authentication/hooks/useKratosFlow';
import KratosForm from '@/core/auth/authentication/components/Kratos/KratosForm';
import KratosUI from '@/core/auth/authentication/components/KratosUI';
import { KratosRemovedFieldAttributes } from '@/core/auth/authentication/components/Kratos/constants';
import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import { Alert, Typography, Box } from '@mui/material';

// Remove password and profile fields - show only WebAuthn/Passkey related settings
const REMOVED_FIELDS: readonly KratosRemovedFieldAttributes[] = [
  // Remove password change fields
  { name: 'password' },
  { name: 'password_identifier' },
  // Remove profile fields
  { name: 'traits.name.first' },
  { name: 'traits.name.last' },
  { name: 'traits.email' },
  { name: 'traits.accepted_terms' },
  { name: 'traits.picture' },
  // Remove profile submit
  { type: 'submit', value: 'profile' },
  // Remove password submit
  { type: 'submit', value: 'password' },
  // Remove OIDC link/unlink buttons for this page
  { name: 'link' },
  { name: 'unlink' },
];

export const UserSecuritySettingsPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const flowId = searchParams.get('flow') ?? undefined;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { flow: settingsFlow, loading, error, refetch } = useKratosFlow(FlowTypeName.Settings, flowId);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const form = e.currentTarget;
      const formData = new FormData(form);

      // Get the submit button that was clicked
      const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
      if (submitter?.name && submitter?.value) {
        formData.set(submitter.name, submitter.value);
      }

      setIsSubmitting(true);

      try {
        const response = await fetch(form.action, {
          method: form.method || 'POST',
          body: new URLSearchParams(formData as unknown as Record<string, string>),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          credentials: 'include',
        });

        if (response.ok || response.status === 422) {
          // Refresh the flow to get updated data
          refetch();
        } else {
          console.error('Settings update failed:', response.status);
        }
      } catch (err) {
        console.error('Settings update error:', err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [refetch]
  );

  if (loading) {
    return (
      <UserAdminLayout currentTab={SettingsSection.Security}>
        <PageContent background="transparent">
          <Loading text={t('kratos.loading-flow')} />
        </PageContent>
      </UserAdminLayout>
    );
  }

  if (error) {
    return (
      <UserAdminLayout currentTab={SettingsSection.Security}>
        <PageContent background="transparent">
          <ErrorDisplay />
        </PageContent>
      </UserAdminLayout>
    );
  }

  // Check if WebAuthn/Passkey nodes are present in the flow
  const hasWebAuthnNodes = settingsFlow?.ui?.nodes?.some(
    node =>
      node.group === 'webauthn' ||
      node.group === 'passkey' ||
      (node.attributes.node_type === 'input' &&
        'onclickTrigger' in node.attributes &&
        (node.attributes.onclickTrigger?.startsWith('oryWebAuthn') ||
          node.attributes.onclickTrigger?.startsWith('oryPasskey')))
  );

  return (
    <UserAdminLayout currentTab={SettingsSection.Security}>
      <PageContent background="transparent">
        <PageContentBlock>
          <BlockTitle>{t('pages.admin.user.security.title')}</BlockTitle>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('pages.admin.user.security.description')}
          </Typography>

          {!hasWebAuthnNodes && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {t('pages.admin.user.security.not-enabled')}
            </Alert>
          )}

          {settingsFlow?.ui && (
            <Box sx={{ mt: 2 }}>
              <SecurityFormContext.Provider value={contextValue}>
                <Box
                  component="form"
                  action={settingsFlow.ui.action}
                  method={settingsFlow.ui.method}
                  onSubmit={handleSubmit}
                  noValidate
                >
                  <KratosUI
                    ui={settingsFlow.ui}
                    removedFields={REMOVED_FIELDS}
                    flowType="settings"
                    disableInputs={isSubmitting}
                  />
                </Box>
              </SecurityFormContext.Provider>
            </Box>
          )}
        </PageContentBlock>
      </PageContent>
    </UserAdminLayout>
  );
};

export default UserSecuritySettingsPage;
