import Loading from '@/core/ui/loading/Loading';
import {
  useSpaceBodyOfKnowledgeAboutQuery,
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
import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import { VirtualContributorBodyOfKnowledgeType } from '@/core/apollo/generated/graphql-schema';
import VCSettingsPageLayout from '../layout/VCSettingsPageLayout';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

export const VCSettingsPage = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const { vcId, loading: urlResolverLoading } = useUrlResolver();

  const { data, loading } = useVirtualContributorQuery({
    variables: {
      id: vcId!,
    },
    skip: !vcId,
  });

  const { data: bokProfile } = useSpaceBodyOfKnowledgeAboutQuery({
    variables: {
      spaceId: data?.lookup.virtualContributor?.bodyOfKnowledgeID!,
    },
    skip:
      !data?.lookup.virtualContributor?.bodyOfKnowledgeID ||
      data?.lookup.virtualContributor?.bodyOfKnowledgeType !== VirtualContributorBodyOfKnowledgeType.AlkemioSpace,
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

  if (urlResolverLoading || loading) {
    return (
      <Loading
        text={t('components.loading.message', { blockName: t('pages.virtualContributorProfile.settings.title') })}
      />
    );
  }

  return (
    <StorageConfigContextProvider
      locationType="virtualContributor"
      virtualContributorId={data?.lookup.virtualContributor?.id ?? ''}
    >
      <VCSettingsPageLayout currentTab={SettingsSection.MyProfile}>
        <PageContent background="background.paper">
          <PageContentColumn columns={12}>
            <PageContentBlock>
              {data?.lookup.virtualContributor && (
                <VirtualContributorForm
                  virtualContributor={data?.lookup.virtualContributor}
                  bokProfile={bokProfile?.lookup.space?.about.profile}
                  avatar={data?.lookup.virtualContributor.profile.avatar}
                  onSave={handleUpdate}
                />
              )}
            </PageContentBlock>
          </PageContentColumn>
        </PageContent>
      </VCSettingsPageLayout>
    </StorageConfigContextProvider>
  );
};

export default VCSettingsPage;
