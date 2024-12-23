import Loading from '@/core/ui/loading/Loading';
import { useUrlParams } from '@/core/routing/useUrlParams';
import {
  useBodyOfKnowledgeProfileQuery,
  useUpdateVirtualContributorMutation,
  useVirtualContributorQuery,
} from '@/core/apollo/generated/apollo-hooks';
import VirtualContributorForm from './VirtualContributorForm';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContent from '@/core/ui/content/PageContent';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { useTranslation } from 'react-i18next';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { AiPersonaBodyOfKnowledgeType } from '@/core/apollo/generated/graphql-schema';
import VCSettingsPageLayout from '../layout/VCSettingsPageLayout';

export const VCSettingsPage = () => {
  const { t } = useTranslation();

  const { vcNameId = '' } = useUrlParams();

  const notify = useNotification();

  const { data, loading } = useVirtualContributorQuery({
    variables: {
      id: vcNameId,
    },
  });

  const { data: bokProfile } = useBodyOfKnowledgeProfileQuery({
    variables: {
      spaceId: data?.virtualContributor?.aiPersona?.bodyOfKnowledgeID!,
    },
    skip:
      !data?.virtualContributor?.aiPersona?.bodyOfKnowledgeID ||
      data?.virtualContributor?.aiPersona?.bodyOfKnowledgeType !== AiPersonaBodyOfKnowledgeType.AlkemioSpace,
  });

  const [updateContributorMutation] = useUpdateVirtualContributorMutation();

  const handleUpdate = virtualContributor => {
    updateContributorMutation({
      variables: {
        virtualContributorData: {
          ID: virtualContributor.ID,
          profileData: virtualContributor.profileData,
        },
      },
      onCompleted: () => {
        notify(t('pages.virtualContributorProfile.success', { entity: t('common.profile') }), 'success');
      },
    });
  };

  if (loading) {
    return (
      <Loading
        text={t('components.loading.message', { blockName: t('pages.virtualContributorProfile.settings.title') })}
      />
    );
  }

  if (!data?.virtualContributor) {
    return null;
  }

  return (
    <StorageConfigContextProvider locationType="virtualContributor" virtualContributorId={data.virtualContributor.id}>
      <VCSettingsPageLayout currentTab={SettingsSection.MyProfile}>
        <PageContent background="background.paper">
          <PageContentColumn columns={12}>
            <PageContentBlock>
              <VirtualContributorForm
                virtualContributor={data?.virtualContributor}
                bokProfile={bokProfile?.lookup.space?.profile}
                avatar={data?.virtualContributor.profile.avatar}
                onSave={handleUpdate}
              />
            </PageContentBlock>
          </PageContentColumn>
        </PageContent>
      </VCSettingsPageLayout>
    </StorageConfigContextProvider>
  );
};

export default VCSettingsPage;
