import {
  useUpdateVirtualContributorMutation,
  useVirtualContributorQuery,
  useRefreshBodyOfKnowledgeMutation,
  useUpdateVirtualContributorSettingsMutation,
} from '@/core/apollo/generated/apollo-hooks';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContent from '@/core/ui/content/PageContent';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { Trans, useTranslation } from 'react-i18next';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import VCSettingsPageLayout from '../layout/VCSettingsPageLayout';
import SwitchSettingsGroup from '@/core/ui/forms/SettingsGroups/SwitchSettingsGroup';
import { useNotification } from '@/core/ui/notifications/useNotification';
import RadioSettingsGroup from '@/core/ui/forms/SettingsGroups/RadioSettingsGroup';
import {
  AiPersonaEngine,
  AiPersonaBodyOfKnowledgeType,
  SearchVisibility,
} from '@/core/apollo/generated/graphql-schema';
import { BlockTitle, Caption } from '@/core/ui/typography';
import { Actions } from '@/core/ui/actions/Actions';
import { LoadingButton } from '@mui/lab';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import Gutters from '@/core/ui/grid/Gutters';
import { Box, Tooltip } from '@mui/material';

type VCAccessibilityProps = {
  listedInStore?: boolean;
  searchVisibility?: SearchVisibility;
};

const VCAccessibilitySettingsPage = () => {
  const { t } = useTranslation();
  const notify = useNotification();

  const { vcId } = useUrlResolver();
  const { data } = useVirtualContributorQuery({
    variables: { id: vcId! },
    skip: !vcId,
  });

  const vc = data?.lookup.virtualContributor;

  const [updateContributorMutation] = useUpdateVirtualContributorMutation();
  const handleUpdate = (props: VCAccessibilityProps) => {
    updateContributorMutation({
      variables: {
        virtualContributorData: {
          ID: vc?.id ?? '',
          ...props,
        },
      },
      onCompleted: () => {
        notify(t('pages.virtualContributorProfile.success', { entity: t('common.settings') }), 'success');
      },
    });
  };

  const [updateSettings, { loading: loadingSettings }] = useUpdateVirtualContributorSettingsMutation();
  const handleUpdateSettings = (isVisible: boolean) => {
    updateSettings({
      variables: {
        settingsData: {
          virtualContributorID: vc?.id ?? '',
          settings: {
            privacy: {
              knowledgeBaseContentVisible: isVisible,
            },
          },
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
          virtualContributorID: vc?.id ?? '',
        },
      },
      onCompleted: () => {
        notify(t('pages.virtualContributorProfile.success', { entity: t('common.settings') }), 'success');
      },
    });
  };

  if (!vc) {
    return null;
  }

  const type = vc?.aiPersona?.bodyOfKnowledgeType;
  const isGuidanceType = vc?.aiPersona?.engine === AiPersonaEngine.Guidance;
  const ingestionAvailable =
    isGuidanceType ||
    type === AiPersonaBodyOfKnowledgeType.AlkemioSpace ||
    type === AiPersonaBodyOfKnowledgeType.AlkemioKnowledgeBase;

  return (
    <StorageConfigContextProvider locationType="virtualContributor" virtualContributorId={vc?.id}>
      <VCSettingsPageLayout currentTab={SettingsSection.Settings}>
        <PageContent background="background.paper">
          <PageContentColumn columns={12}>
            <PageContentBlock>
              <BlockTitle>{t('pages.virtualContributorProfile.settings.access.title')}</BlockTitle>
              <RadioSettingsGroup
                value={vc?.searchVisibility ?? SearchVisibility.Account}
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
                    checked: vc?.listedInStore ?? false,
                    disabled: vc?.searchVisibility !== SearchVisibility.Public,
                    label: t('pages.virtualContributorProfile.settings.access.listedInStore'),
                  },
                }}
                onChange={(key, newValue) => updateListedInStore(newValue)}
              />
            </PageContentBlock>
          </PageContentColumn>
        </PageContent>
        {ingestionAvailable && (
          <PageContent background="background.paper">
            <PageContentColumn columns={12}>
              <PageContentBlock>
                <BlockTitle>{t('pages.virtualContributorProfile.settings.ingestion.title')}</BlockTitle>
                <Tooltip
                  title={
                    <>
                      <Box>
                        {t('pages.virtualContributorProfile.settings.privacy.tooltip1', {
                          vcName: vc?.profile?.displayName,
                        })}
                      </Box>
                      <Box>{t('pages.virtualContributorProfile.settings.privacy.tooltip2')}</Box>
                    </>
                  }
                  placement="top-start"
                >
                  <Gutters disablePadding>
                    <SwitchSettingsGroup
                      options={{
                        listedInStore: {
                          checked: !vc?.settings.privacy.knowledgeBaseContentVisible,
                          disabled: loadingSettings,
                          label: t('pages.virtualContributorProfile.settings.privacy.description'),
                        },
                      }}
                      onChange={(_, newValue) => handleUpdateSettings(!newValue)}
                    />
                  </Gutters>
                </Tooltip>
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
