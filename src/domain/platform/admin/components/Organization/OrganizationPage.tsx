import { useTranslation } from 'react-i18next';
import { useOrganization } from '@/domain/community/contributor/organization/hooks/useOrganization';
import { useNotification } from '@/core/ui/notifications/useNotification';
import {
  useCreateOrganizationMutation,
  useCreateTagsetOnProfileMutation,
  useOrganizationProfileInfoQuery,
  useUpdateOrganizationMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { EditMode } from '@/core/ui/forms/editMode';
import { CreateOrganizationInput, Organization, UpdateOrganizationInput } from '@/core/apollo/generated/graphql-schema';
import Loading from '@/core/ui/loading/Loading';
import OrganizationForm from './OrganizationForm';
import clearCacheForQuery from '@/core/apollo/utils/clearCacheForQuery';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import useNavigate from '@/core/routing/useNavigate';

type Props = {
  title?: string;
  mode: EditMode;
};

const OrganizationPage = ({ title, mode }: Props) => {
  const { t } = useTranslation();
  const { organizationNameId } = useOrganization();

  const { data, loading } = useOrganizationProfileInfoQuery({
    variables: { id: organizationNameId! },
    fetchPolicy: 'cache-and-network',
    skip: !organizationNameId,
  });

  const organization = data?.organization;

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
        contactEmail: contactEmail,
        domain: domain,
        legalEntityName: legalEntityName,
        website: website,
        profileData: {
          displayName: profileData.displayName,
          description: profileData.description,
          tagline: profileData.tagline,
          referencesData: profileData.referencesData,
        },
      };

      createOrganization({
        variables: {
          input,
        },
      });
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
        contactEmail: contactEmail,
        domain: domain,
        legalEntityName: legalEntityName,
        website: website,
        profileData: {
          displayName: profileData?.displayName,
          description: profileData?.description,
          tagline: profileData?.tagline,
          location: {
            city: profileData?.location?.city,
            country: profileData?.location?.country,
          },
          references: references,
          tagsets: profileData?.tagsets?.filter(t => t.ID).map(({ ID, tags }) => ({ ID, tags })),
        },
      };

      updateOrganization({
        variables: {
          input,
        },
      });
    }
  };

  if (loading) return <Loading text={t('components.loading.message', { blockName: t('common.organization') })} />;

  return (
    <StorageConfigContextProvider locationType="organization" organizationId={organizationNameId}>
      <OrganizationForm
        organization={organization as Organization}
        onSave={handleSubmit}
        editMode={mode}
        title={title}
      />
    </StorageConfigContextProvider>
  );
};

export default OrganizationPage;
