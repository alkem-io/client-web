import {
  useRefreshBodyOfKnowledgeMutation,
  useUpdateVirtualContributorSettingsMutation,
} from '@/core/apollo/generated/apollo-hooks';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContent from '@/core/ui/content/PageContent';
import { useTranslation } from 'react-i18next';
import SwitchSettingsGroup from '@/core/ui/forms/SettingsGroups/SwitchSettingsGroup';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { AiPersonaEngine, AiPersonaBodyOfKnowledgeType } from '@/core/apollo/generated/graphql-schema';
import { BlockTitle, Caption } from '@/core/ui/typography';
import { Actions } from '@/core/ui/actions/Actions';
import { LoadingButton } from '@mui/lab';
import Gutters from '@/core/ui/grid/Gutters';
import { Box, Tooltip } from '@mui/material';

const BodyOfKnowledgeManagement = ({ vc }) => {
  const { t } = useTranslation();
  const notify = useNotification();

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

  const type = vc?.aiPersona?.bodyOfKnowledgeType;
  const isGuidanceType = vc?.aiPersona?.engine === AiPersonaEngine.Guidance;

  const ingestionAvailable =
    isGuidanceType ||
    type === AiPersonaBodyOfKnowledgeType.AlkemioSpace ||
    type === AiPersonaBodyOfKnowledgeType.AlkemioKnowledgeBase;

  if (!vc || !ingestionAvailable) {
    return null;
  }

  return (
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
  );
};

export default BodyOfKnowledgeManagement;
