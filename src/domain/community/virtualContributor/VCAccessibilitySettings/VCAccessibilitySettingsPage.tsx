import { useUrlParams } from '@/core/routing/useUrlParams';
import {
  useUpdateVirtualContributorMutation,
  useVirtualContributorQuery,
  useRefreshBodyOfKnowledgeMutation,
} from '@/core/apollo/generated/apollo-hooks';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContent from '@/core/ui/content/PageContent';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { Trans, useTranslation } from 'react-i18next';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/constants';
import VCSettingsPageLayout from '../layout/VCSettingsPageLayout';
import SwitchSettingsGroup from '@/core/ui/forms/SettingsGroups/SwitchSettingsGroup';
import { useNotification } from '@/core/ui/notifications/useNotification';
import RadioSettingsGroup from '@/core/ui/forms/SettingsGroups/RadioSettingsGroup';
import { AiPersonaBodyOfKnowledgeType, SearchVisibility } from '@/core/apollo/generated/graphql-schema';
import { BlockTitle, Caption } from '@/core/ui/typography';
import { Actions } from '@/core/ui/actions/Actions';
import { LoadingButton } from '@mui/lab';

type VCAccessibilityProps = {
  listedInStore?: boolean;
  searchVisibility?: SearchVisibility;
};

export const VCAccessibilitySettingsPage = () => {
  const { t } = useTranslation();

  const { vcNameId = '' } = useUrlParams();

  const notify = useNotification();

  const { data } = useVirtualContributorQuery({
    variables: {
      id: vcNameId,
    },
  });

  const [updateContributorMutation] = useUpdateVirtualContributorMutation();
  const handleUpdate = (props: VCAccessibilityProps) => {
    updateContributorMutation({
      variables: {
        virtualContributorData: {
          ID: data?.virtualContributor?.id ?? '',
          ...props,
        },
      },
      onCompleted: () => {
        notify(t('pages.virtualContributorProfile.success', { entity: t('common.settings') }), 'success');
      },
    });
  };

  const updateListedInStore = (newValue: boolean) => {
    handleUpdate({ listedInStore: newValue });
  };

  const updateVisibility = (newValue: SearchVisibility) => {
    handleUpdate({ searchVisibility: newValue });
  };

  const [updateBodyOfKnowledge, { loading: updateLoading }] = useRefreshBodyOfKnowledgeMutation();
  const refreshIngestion = () => {
    updateBodyOfKnowledge({
      variables: {
        refreshData: {
          virtualContributorID: data?.virtualContributor?.id ?? '',
        },
      },
      onCompleted: () => {
        notify(t('pages.virtualContributorProfile.success', { entity: t('common.settings') }), 'success');
      },
    });
  };

  if (!data?.virtualContributor) {
    return null;
  }

  return (
    <StorageConfigContextProvider locationType="virtualContributor" virtualContributorId={data.virtualContributor.id}>
      <VCSettingsPageLayout currentTab={SettingsSection.Settings}>
        <PageContent background="background.paper">
          <PageContentColumn columns={12}>
            <PageContentBlock>
              <BlockTitle>{t('pages.virtualContributorProfile.settings.access.title')}</BlockTitle>
              <RadioSettingsGroup
                value={data?.virtualContributor?.searchVisibility ?? SearchVisibility.Account}
                options={{
                  [SearchVisibility.Public]: {
                    label: (
                      <Trans
                        i18nKey="pages.virtualContributorProfile.settings.access.visibility.public"
                        components={{ b: <strong /> }}
                      />
                    ),
                  },
                  [SearchVisibility.Account]: {
                    label: (
                      <Trans
                        i18nKey="pages.virtualContributorProfile.settings.access.visibility.private"
                        components={{ b: <strong /> }}
                      />
                    ),
                  },
                  [SearchVisibility.Hidden]: {
                    label: (
                      <Trans
                        i18nKey="pages.virtualContributorProfile.settings.access.visibility.hidden"
                        components={{ b: <strong /> }}
                      />
                    ),
                  },
                }}
                onChange={newValue => updateVisibility(newValue)}
              />
              <SwitchSettingsGroup
                options={{
                  listedInStore: {
                    checked: data?.virtualContributor?.listedInStore ?? false,
                    disabled: data?.virtualContributor?.searchVisibility !== SearchVisibility.Public,
                    label: t('pages.virtualContributorProfile.settings.access.listedInStore'),
                  },
                }}
                onChange={(key, newValue) => updateListedInStore(newValue)}
              />
            </PageContentBlock>
          </PageContentColumn>
        </PageContent>
        {data?.virtualContributor?.aiPersona?.bodyOfKnowledgeType === AiPersonaBodyOfKnowledgeType.AlkemioSpace && (
          <PageContent background="background.paper">
            <PageContentColumn columns={12}>
              <PageContentBlock>
                <BlockTitle>{t('pages.virtualContributorProfile.settings.ingestion.title')}</BlockTitle>
                <Caption>{t('pages.virtualContributorProfile.settings.ingestion.infoText')}</Caption>
                <Actions>
                  <LoadingButton variant="contained" loading={updateLoading} onClick={refreshIngestion}>
                    {t('pages.virtualContributorProfile.settings.ingestion.refreshBtn')}
                  </LoadingButton>
                </Actions>
              </PageContentBlock>
            </PageContentColumn>
          </PageContent>
        )}
      </VCSettingsPageLayout>
    </StorageConfigContextProvider>
  );
};

export default VCAccessibilitySettingsPage;
