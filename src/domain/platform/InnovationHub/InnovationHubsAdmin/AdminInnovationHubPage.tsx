import { sortBy } from 'lodash';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../../../core/ui/notifications/useNotification';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import {
  useAdminInnovationHubQuery,
  useOrganizationsListQuery,
  useUpdateInnovationHubMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import InnovationHubForm, { InnovationHubFormValues } from './InnovationHubForm';
import { StorageConfigContextProvider } from '../../storage/StorageBucket/StorageConfigContext';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import AdminLayout from '../../admin/layout/toplevel/AdminLayout';
import { AdminSection } from '../../admin/layout/toplevel/constants';
import RouterLink from '../../../../core/ui/link/RouterLink';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button } from '@mui/material';

interface AdminInnovationHubPageProps {}

const AdminInnovationHubPage: FC<AdminInnovationHubPageProps> = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { innovationHubNameId } = useUrlParams();

  if (!innovationHubNameId) {
    throw new Error('Must be within Innovation Hub');
  }

  const { data, loading } = useAdminInnovationHubQuery({
    variables: { innovationHubId: innovationHubNameId },
  });

  const innovationHubId = data?.platform.innovationHub?.id;

  const { data: organizationsList, loading: loadingOrganizations } = useOrganizationsListQuery();
  const organizations = useMemo(
    () =>
      sortBy(
        organizationsList?.organizations.map(e => ({ id: e.id, name: e.profile.displayName })) || [],
        org => org.name
      ),
    [organizationsList]
  );

  const [updateInnovationHub, { loading: updating }] = useUpdateInnovationHubMutation();

  const handleSubmit = async (formData: InnovationHubFormValues) => {
    if (!innovationHubId) {
      return;
    }
    const { data } = await updateInnovationHub({
      variables: {
        hubData: {
          ID: innovationHubId,
          profileData: {
            displayName: formData.profile.displayName,
            description: formData.profile.description,
            tagline: formData.profile.tagline,
            tagsets: formData.profile.tagsets.map(tagset => ({
              ID: tagset.id,
              name: tagset.name,
              tags: tagset.tags,
            })),
          },
        },
      },
    });
    if (data?.updateInnovationHub.nameID) {
      notify(t('pages.admin.innovationHubs.saved'), 'success');
    }
  };

  const innovationHub = data?.platform.innovationHub;

  const isLoading = loading || loadingOrganizations || updating;

  return (
    <AdminLayout currentTab={AdminSection.InnovationHubs}>
      <PageContent>
        <PageContentColumn columns={12}>
          <Button component={RouterLink} to="../" startIcon={<ArrowBackIcon />}>
            {t('pages.admin.innovationHubs.back')}
          </Button>
          <StorageConfigContextProvider locationType="organization" organizationId={undefined}>
            <InnovationHubForm
              nameID={innovationHub?.nameID}
              profile={innovationHub?.profile}
              subdomain={innovationHub?.subdomain}
              organizations={organizations}
              onSubmit={handleSubmit}
              loading={isLoading}
            />
          </StorageConfigContextProvider>
        </PageContentColumn>
      </PageContent>
    </AdminLayout>
  );
};

export default AdminInnovationHubPage;
