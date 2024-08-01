import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button } from '@mui/material';
import { sortBy } from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useNavigate from '../../../../../../core/routing/useNavigate';
import {
  refetchAdminInnovationPacksListQuery,
  useCreateInnovationPackMutation,
  useOrganizationsListQuery,
} from '../../../../../../core/apollo/generated/apollo-hooks';
import RouterLink from '../../../../../../core/ui/link/RouterLink';
import AdminLayout from '../../../layout/toplevel/AdminLayout';
import { AdminSection } from '../../../layout/toplevel/constants';
import InnovationPackForm, { InnovationPackFormValues } from './InnovationPackForm';

const AdminNewInnovationPackPage = () => {
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

  const [createInnovationPack, { loading: creating }] = useCreateInnovationPackMutation();

  const handleSubmit = async (formData: InnovationPackFormValues) => {
    const { data } = await createInnovationPack({
      variables: {
        packData: {
          accountID: 'Use account ID, not provider ID', // TODO
          nameID: formData.nameID,
          profileData: {
            displayName: formData.profile.displayName,
            description: formData.profile.description,
          },
        },
      },
      refetchQueries: [refetchAdminInnovationPacksListQuery()],
    });
    if (data?.createInnovationPack.nameID) {
      navigate(`/innovation-packs/${data?.createInnovationPack.nameID}/settings`);
    }
  };

  const isLoading = loadingOrganizations || creating;

  return (
    <AdminLayout currentTab={AdminSection.InnovationPacks}>
      <Button component={RouterLink} to="../" startIcon={<ArrowBackIcon />}>
        {t('pages.admin.innovation-packs.back-button')}
      </Button>
      <InnovationPackForm isNew organizations={organizations} onSubmit={handleSubmit} loading={isLoading} />
    </AdminLayout>
  );
};

export default AdminNewInnovationPackPage;
