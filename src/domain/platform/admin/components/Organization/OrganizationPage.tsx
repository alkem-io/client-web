import { useTranslation } from 'react-i18next';
import { useNotification } from '@/core/ui/notifications/useNotification';
import {
  useCreateOrganizationMutation,
  useCreateTagsetOnProfileMutation,
  useOrganizationProfileInfoQuery,
  useUpdateOrganizationMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { EditMode } from '@/core/ui/forms/editMode';
import { CreateOrganizationInput, UpdateOrganizationInput } from '@/core/apollo/generated/graphql-schema';
import Loading from '@/core/ui/loading/Loading';
import OrganizationForm from './OrganizationForm';
import clearCacheForQuery from '@/core/apollo/utils/clearCacheForQuery';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import useNavigate from '@/core/routing/useNavigate';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { EmptyOrganizationModel, OrganizationModel } from '@/domain/community/organization/model/OrganizationModel';
import { formatLocation } from '@/domain/common/location/LocationUtils';
import { EmptyProfileModel } from '@/domain/common/profile/ProfileModel';

type Props = {
  mode: EditMode;
};

const OrganizationPage = ({ mode }: Props) => {
  const { t } = useTranslation();
  const { organizationId } = useUrlResolver();

  const { data, loading } = useOrganizationProfileInfoQuery({
    variables: { id: organizationId! },
    fetchPolicy: 'cache-and-network',
    skip: !organizationId,
  });

  const organizationData = data?.lookup.organization;
  const organization: OrganizationModel = {
    ...(organizationData ?? EmptyOrganizationModel),
    profile: {
      ...(organizationData?.profile ?? EmptyProfileModel),
      location: formatLocation(organizationData?.profile.location),
    },
  };

  const notify = useNotification();
  const navigate = useNavigate();
  const [createTagset] = useCreateTagsetOnProfileMutation({
    // Just log the error. Do not send it to the notification handler.
    // there is an issue handling multiple snackbars.
    onError: error => console.error(error.message),
  });

  const [createOrganization] = useCreateOrganizationMutation({
    onCompleted: data => {
      const organizationURL = data.createOrganization.profile.url;
      notify(t('pages.admin.organization.notifications.organization-created'), 'success');
      navigate(organizationURL);
    },
    update: cache => clearCacheForQuery(cache, 'organizationsPaginated'),
  });

  const [updateOrganization] = useUpdateOrganizationMutation({
    onCompleted: () => {
      notify('Organization updated successfully', 'success');
    },
  });

  const handleSubmit = async (editedOrganization: CreateOrganizationInput | UpdateOrganizationInput) => {
    if (mode === EditMode.new) {
      const { nameID, profileData, contactEmail, domain, legalEntityName, website } =
        editedOrganization as CreateOrganizationInput;

      const input: CreateOrganizationInput = {
        nameID,
        contactEmail,
        domain,
        legalEntityName,
        website,
        profileData: {
          displayName: profileData.displayName,
          description: profileData.description,
          tagline: profileData.tagline,
          referencesData: profileData.referencesData,
        },
      };

      await createOrganization({ variables: { input } });
    }

    if (mode === EditMode.edit) {
      const {
        ID: orgID,
        nameID,
        profileData,
        contactEmail,
        domain,
        legalEntityName,
        website,
      } = editedOrganization as UpdateOrganizationInput;
      const profileId = organization?.profile.id;
      const references = profileData?.references;
      const tagsetsToAdd = profileData?.tagsets?.filter(x => !x.ID) || [];

      for (const tagset of tagsetsToAdd) {
        if (tagset.name && tagset.tags) {
          await createTagset({
            variables: {
              input: {
                name: tagset.name,
                tags: tagset.tags,
                profileID: profileId,
              },
            },
          });
        }
      }
      const input: UpdateOrganizationInput = {
        ID: orgID,
        nameID,
        contactEmail,
        domain,
        legalEntityName,
        website,
        profileData: {
          displayName: profileData?.displayName,
          description: profileData?.description,
          tagline: profileData?.tagline,
          location: {
            city: profileData?.location?.city,
            country: profileData?.location?.country,
          },
          references,
          tagsets: profileData?.tagsets?.filter(t => t.ID).map(({ ID, tags }) => ({ ID, tags })),
        },
      };

      await updateOrganization({ variables: { input } });
    }
  };

  if (loading) return <Loading text={t('components.loading.message', { blockName: t('common.organization') })} />;

  return (
    <StorageConfigContextProvider locationType="organization" organizationId={organizationId}>
      <OrganizationForm organization={organization} onSave={handleSubmit} editMode={mode} />
    </StorageConfigContextProvider>
  );
};

export default OrganizationPage;
