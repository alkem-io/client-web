import { sortBy } from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { useUrlParams } from '@/core/routing/useUrlParams';
import {
  useAccountsListQuery,
  useAdminInnovationHubQuery,
  useUpdateInnovationHubMutation,
} from '@/core/apollo/generated/apollo-hooks';
import InnovationHubForm, { InnovationHubFormValues } from './InnovationHubForm';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import PageContent from '@/core/ui/content/PageContent';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import AdminLayout from '@/domain/platform/admin/layout/toplevel/AdminLayout';
import { AdminSection } from '@/domain/platform/admin/layout/toplevel/constants';
import RouterLink from '@/core/ui/link/RouterLink';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button } from '@mui/material';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import InnovationHubSpacesField from './InnovationHubSpacesField';

const AdminInnovationHubPage = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { innovationHubNameId } = useUrlParams();

  if (!innovationHubNameId) {
    throw new Error('Must be within Innovation Hub');
  }

  const { data, loading } = useAdminInnovationHubQuery({
    variables: { innovationHubId: innovationHubNameId },
  });

  const innovationHub = data?.platform.innovationHub;

  const { data: accountsList, loading: loadingAccounts } = useAccountsListQuery();
  const accounts = useMemo(
    () =>
      sortBy(
        accountsList?.accounts.map(acc => ({ id: acc.id, name: acc.host?.profile.displayName ?? acc.id })) || [],
        acc => acc.name
      ),
    [accountsList]
  );

  const [updateInnovationHub, { loading: updating }] = useUpdateInnovationHubMutation();

  const handleSubmit = async (formData: InnovationHubFormValues) => {
    if (!innovationHub?.id) {
      return;
    }

    const { data } = await updateInnovationHub({
      variables: {
        hubData: {
          ID: innovationHub.id,
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

  const handleSubmitSpaceListFilter = async (spaceListFilter: string[]) => {
    if (!innovationHub?.id) {
      return;
    }
    const { data } = await updateInnovationHub({
      variables: {
        hubData: {
          ID: innovationHub.id,
          spaceListFilter,
        },
      },
      optimisticResponse: {
        updateInnovationHub: {
          ...innovationHub,
          spaceListFilter: sortBy(innovationHub.spaceListFilter, ({ id }) => spaceListFilter.indexOf(id)),
        },
      },
    });
    if (data?.updateInnovationHub.nameID) {
      notify(t('pages.admin.innovationHubs.saved'), 'success');
    }
  };

  const isLoading = loading || loadingAccounts || updating;

  return (
    <AdminLayout currentTab={AdminSection.InnovationHubs}>
      <PageContent>
        <PageContentColumn columns={12}>
          <Button component={RouterLink} to="../" startIcon={<ArrowBackIcon />}>
            {t('pages.admin.innovationHubs.back')}
          </Button>
          <StorageConfigContextProvider locationType="innovationHub" innovationHubId={data?.platform.innovationHub?.id}>
            <InnovationHubForm
              nameID={innovationHub?.nameID}
              profile={innovationHub?.profile}
              accountId={innovationHub?.account.id}
              subdomain={innovationHub?.subdomain}
              accounts={accounts}
              onSubmit={handleSubmit}
              loading={isLoading}
            />
            <PageContentBlock>
              <InnovationHubSpacesField
                spaces={innovationHub?.spaceListFilter}
                onChange={handleSubmitSpaceListFilter}
              />
            </PageContentBlock>
          </StorageConfigContextProvider>
        </PageContentColumn>
      </PageContent>
    </AdminLayout>
  );
};

export default AdminInnovationHubPage;
