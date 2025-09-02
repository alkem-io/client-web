import { useTranslation } from 'react-i18next';
import { BlockTitle, Caption } from '@/core/ui/typography/components';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import SwitchSettingsGroup from '@/core/ui/forms/SettingsGroups/SwitchSettingsGroup';
import { SpaceNotificationSettings } from '@/domain/community/userAdmin/tabs/model/NotificationSettings.model';

interface SpaceNotificationsSettingsProps {
  currentSpaceSettings: SpaceNotificationSettings | undefined;
  onUpdateSettings: (property: string, value: boolean) => void;
}

export const SpaceNotificationsSettings = ({
  currentSpaceSettings,
  onUpdateSettings,
}: SpaceNotificationsSettingsProps) => {
  const { t } = useTranslation();

  return (
    <PageContentBlock>
      <BlockTitle>{t('pages.userNotificationsSettings.space.title')}</BlockTitle>
      <Caption>{t('pages.userNotificationsSettings.space.subtitle')}</Caption>
      <SwitchSettingsGroup
        options={{
          collaborationCalloutPublished: {
            checked: currentSpaceSettings?.collaborationCalloutPublished?.email || false,
            label: t('pages.userNotificationsSettings.space.settings.collaborationCalloutPublished'),
          },
          collaborationCalloutPostContributionComment: {
            checked: currentSpaceSettings?.collaborationCalloutPostContributionComment?.email || false,
            label: t('pages.userNotificationsSettings.space.settings.collaborationCalloutPostContributionComment'),
          },
          collaborationCalloutContributionCreated: {
            checked: currentSpaceSettings?.collaborationCalloutContributionCreated?.email || false,
            label: t('pages.userNotificationsSettings.space.settings.collaborationCalloutContributionCreated'),
          },
          collaborationCalloutComment: {
            checked: currentSpaceSettings?.collaborationCalloutComment?.email || false,
            label: t('pages.userNotificationsSettings.space.settings.collaborationCalloutComment'),
          },
          communicationUpdates: {
            checked: currentSpaceSettings?.communicationUpdates?.email || false,
            label: t('pages.userNotificationsSettings.space.settings.communicationUpdateSent'),
          },
        }}
        onChange={onUpdateSettings}
      />
    </PageContentBlock>
  );
};
