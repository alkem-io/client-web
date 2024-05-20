import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button } from '@mui/material';
import { sortBy } from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useNavigate from '../../../core/routing/useNavigate';
import AdminLayout from '../../platform/admin/layout/toplevel/AdminLayout';
import { AdminSection } from '../../platform/admin/layout/toplevel/constants';
import RouterLink from '../../../core/ui/link/RouterLink';
import InnovationHubForm, { InnovationHubFormValues } from './InnovationHubForm';
import {
  refetchAdminInnovationHubsListQuery,
  useCreateInnovationHubMutation,
  useOrganizationsListQuery,
} from '../../../core/apollo/generated/apollo-hooks';
import { InnovationHubType } from '../../../core/apollo/generated/graphql-schema';
import PageContent from '../../../core/ui/content/PageContent';
import PageContentColumn from '../../../core/ui/content/PageContentColumn';

const AdminNewInnovationHubPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: organizationsList, loading: loadingOrganizations } = useOrganizationsListQuery();

  const organizations = useMemo(
    () =>
      sortBy(
        organizationsList?.organizations.map(e => ({ id: e.id, name: e.profile.displayName })) || [],
        org => org.name
      ),
    [organizationsList]
  );

  const [createInnovationHub, { loading: creating }] = useCreateInnovationHubMutation();

  const handleSubmit = async (formData: InnovationHubFormValues) => {
    const { data } = await createInnovationHub({
      variables: {
        hubData: {
          accountID: 'FIXME',
          nameID: formData.nameID,
          //providerID: formData.providerId, // TODO: Add provider field when serverside is ready
          subdomain: formData.subdomain,
          profileData: {
            displayName: formData.profile.displayName,
            tagline: formData.profile.tagline,
            description: formData.profile.description,
          },
          type: InnovationHubType.List,
          spaceListFilter: [],
        },
      },
      refetchQueries: [refetchAdminInnovationHubsListQuery()],
    });
    if (data?.createInnovationHub.nameID) {
      navigate(`../${data.createInnovationHub.nameID}`);
    }
  };

  const isLoading = loadingOrganizations || creating;

  return (
    <AdminLayout currentTab={AdminSection.InnovationHubs}>
      <PageContent>
        <PageContentColumn columns={12}>
          <Button component={RouterLink} to="../" startIcon={<ArrowBackIcon />}>
            {t('pages.admin.innovationHubs.back')}
          </Button>
          <InnovationHubForm isNew organizations={organizations} onSubmit={handleSubmit} loading={isLoading} />
        </PageContentColumn>
      </PageContent>
    </AdminLayout>
  );
};

export default AdminNewInnovationHubPage;
