import {
  useRefreshBodyOfKnowledgeMutation,
  useUpdateVirtualContributorSettingsMutation,
  useVirtualContributorKnowledgeBaseLastUpdatedQuery,
} from '@/core/apollo/generated/apollo-hooks';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContent from '@/core/ui/content/PageContent';
import { Trans, useTranslation } from 'react-i18next';
import SwitchSettingsGroup from '@/core/ui/forms/SettingsGroups/SwitchSettingsGroup';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { AiPersonaEngine, VirtualContributorBodyOfKnowledgeType } from '@/core/apollo/generated/graphql-schema';
import { BlockTitle, Caption } from '@/core/ui/typography';
import { Actions } from '@/core/ui/actions/Actions';
import Gutters from '@/core/ui/grid/Gutters';
import { Box, Button, Tooltip } from '@mui/material';
import { formatDateTime } from '@/core/utils/time/utils';

interface BodyOfKnowledgeManagementProps {
  vc: {
    id: string;
    settings: {
      privacy: {
        knowledgeBaseContentVisible: boolean;
      };
    };
    profile: {
      displayName: string;
    };
    bodyOfKnowledgeType?: VirtualContributorBodyOfKnowledgeType;
    aiPersona?: {
      id: string;
      engine: AiPersonaEngine;
    };
  };
}

const BodyOfKnowledgeManagement = ({ vc }: BodyOfKnowledgeManagementProps) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const vcId = vc?.id;

  const [updateBodyOfKnowledge, { loading: updateLoading }] = useRefreshBodyOfKnowledgeMutation();
  const { data } = useVirtualContributorKnowledgeBaseLastUpdatedQuery({
    variables: { id: vcId },
    skip: !vcId,
  });
  const lastUpdated = data?.virtualContributor?.aiPersona?.bodyOfKnowledgeLastUpdated;

  const refreshIngestion = () => {
    updateBodyOfKnowledge({
      variables: {
        refreshData: {
          virtualContributorID: vc.id ?? '',
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
          virtualContributorID: vc.id ?? '',
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
      onError: () => {
        notify(t('pages.virtualContributorProfile.error'), 'error');
      },
    });
  };

  const type = vc.bodyOfKnowledgeType;
  const isGuidanceType = vc.aiPersona?.engine === AiPersonaEngine.Guidance;

  const ingestionAvailable =
    isGuidanceType ||
    type === VirtualContributorBodyOfKnowledgeType.AlkemioSpace ||
    type === VirtualContributorBodyOfKnowledgeType.AlkemioKnowledgeBase;

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
                    vcName: vc.profile?.displayName,
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
                    checked: !vc.settings.privacy.knowledgeBaseContentVisible,
                    disabled: loadingSettings,
                    label: t('pages.virtualContributorProfile.settings.privacy.description'),
                  },
                }}
                onChange={(_, newValue) => handleUpdateSettings(!newValue)}
              />
            </Gutters>
          </Tooltip>
          <Caption>
            <Trans
              i18nKey={'pages.virtualContributorProfile.settings.ingestion.infoText'}
              components={{ bold: <b /> }}
            />
          </Caption>
          <Actions sx={{ marginTop: 2, display: 'flex', alignItems: 'baseline', gap: 1, justifyContent: 'flex-end' }}>
            <Box sx={{ color: 'muted.main', display: 'flex', fontSize: 14 }}>
              {t('pages.virtualContributorProfile.settings.ingestion.lastUpdatedLabel')}
              {lastUpdated
                ? formatDateTime(lastUpdated)
                : t('pages.virtualContributorProfile.settings.ingestion.never')}
            </Box>
            <Button variant="contained" loading={updateLoading} onClick={refreshIngestion}>
              {t('pages.virtualContributorProfile.settings.ingestion.refreshBtn')}
            </Button>
          </Actions>
        </PageContentBlock>
      </PageContentColumn>
    </PageContent>
  );
};

export default BodyOfKnowledgeManagement;
