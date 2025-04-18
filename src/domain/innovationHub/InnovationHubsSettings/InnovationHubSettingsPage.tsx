import { sortBy } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { useInnovationHubSettingsQuery, useUpdateInnovationHubMutation } from '@/core/apollo/generated/apollo-hooks';
import InnovationHubForm, { InnovationHubFormValues } from '../InnovationHubsSettings/InnovationHubForm';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import PageContent from '@/core/ui/content/PageContent';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import InnovationHubSpacesField from '../InnovationHubsSettings/InnovationHubSpacesField';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import InnovationHubProfileLayout from '../InnovationHubsSettings/InnovationHubProfileLayout';

const InnovationHubSettingsPage = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { innovationHubId } = useUrlResolver();

  const { data, loading } = useInnovationHubSettingsQuery({
    variables: { innovationHubId: innovationHubId! },
    skip: !innovationHubId,
  });

  const innovationHub = data?.platform.innovationHub;

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
    if (data?.updateInnovationHub.id) {
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
    if (data?.updateInnovationHub.id) {
      notify(t('pages.admin.innovationHubs.saved'), 'success');
    }
  };

  const isLoading = loading || updating;

  return (
    <InnovationHubProfileLayout innovationHub={innovationHub} loading={loading}>
      <PageContent background="transparent">
        <PageContentColumn columns={12}>
          <StorageConfigContextProvider locationType="innovationHub" innovationHubId={data?.platform.innovationHub?.id}>
            <InnovationHubForm
              profile={innovationHub?.profile}
              subdomain={innovationHub?.subdomain}
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
    </InnovationHubProfileLayout>
  );
};

export default InnovationHubSettingsPage;
