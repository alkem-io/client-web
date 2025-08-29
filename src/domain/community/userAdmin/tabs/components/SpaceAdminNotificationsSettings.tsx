import { useTranslation } from 'react-i18next';
import { BlockTitle, Caption } from '@/core/ui/typography/components';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import SwitchSettingsGroup from '@/core/ui/forms/SettingsGroups/SwitchSettingsGroup';
import { SpaceAdminNotificationSettings } from '@/domain/community/userAdmin/tabs/model/NotificationSettings.model';

interface SpaceAdminNotificationsSettingsProps {
  currentSpaceAdminSettings: SpaceAdminNotificationSettings | undefined;
  onUpdateSettings: (property: string, value: boolean) => void;
}

export const SpaceAdminNotificationsSettings = ({
  currentSpaceAdminSettings,
  onUpdateSettings,
}: SpaceAdminNotificationsSettingsProps) => {
  const { t } = useTranslation();

  return (
    <PageContentBlock>
      <BlockTitle>{t('pages.userNotificationsSettings.spaceAdmin.title')}</BlockTitle>
      <Caption>{t('pages.userNotificationsSettings.spaceAdmin.subtitle')}</Caption>
      <SwitchSettingsGroup
        options={{
          communityApplicationReceived: {
            checked: currentSpaceAdminSettings?.communityApplicationReceived?.email || false,
            label: t('pages.userNotificationsSettings.spaceAdmin.settings.communityApplicationReceived'),
          },
          communityNewMember: {
            checked: currentSpaceAdminSettings?.communityNewMember?.email || false,
            label: t('pages.userNotificationsSettings.spaceAdmin.settings.communityNewMember'),
          },
          collaborationCalloutContributionCreated: {
            checked: currentSpaceAdminSettings?.collaborationCalloutContributionCreated?.email || false,
            label: t('pages.userNotificationsSettings.spaceAdmin.settings.collaborationCalloutContributionCreated'),
          },
          communicationMessageReceived: {
            checked: currentSpaceAdminSettings?.communicationMessageReceived?.email || false,
            label: t('pages.userNotificationsSettings.spaceAdmin.settings.communicationMessageReceived'),
          },
        }}
        onChange={onUpdateSettings}
      />
    </PageContentBlock>
  );
};
