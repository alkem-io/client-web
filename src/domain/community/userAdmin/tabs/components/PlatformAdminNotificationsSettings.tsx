import { useTranslation } from 'react-i18next';
import { BlockTitle, Caption } from '@/core/ui/typography/components';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import SwitchSettingsGroup from '@/core/ui/forms/SettingsGroups/SwitchSettingsGroup';
import { PlatformAdminNotificationSettings } from '@/domain/community/userAdmin/tabs/model/NotificationSettings.model';

interface PlatformAdminNotificationsSettingsProps {
  currentPlatformAdminSettings: PlatformAdminNotificationSettings | undefined;
  onUpdateSettings: (property: string, value: boolean) => void;
}

export const PlatformAdminNotificationsSettings = ({
  currentPlatformAdminSettings,
  onUpdateSettings,
}: PlatformAdminNotificationsSettingsProps) => {
  const { t } = useTranslation();

  return (
    <PageContentBlock>
      <BlockTitle>{t('pages.userNotificationsSettings.platformAdmin.title')}</BlockTitle>
      <Caption>{t('pages.userNotificationsSettings.platformAdmin.subtitle')}</Caption>
      <SwitchSettingsGroup
        options={{
          userProfileCreated: {
            checked: currentPlatformAdminSettings?.userProfileCreated?.email || false,
            label: t('pages.userNotificationsSettings.platformAdmin.settings.adminUserProfileCreated'),
          },
          userProfileRemoved: {
            checked: currentPlatformAdminSettings?.userProfileRemoved?.email || false,
            label: t('pages.userNotificationsSettings.platformAdmin.settings.adminUserProfileRemoved'),
          },
          userGlobalRoleChanged: {
            checked: currentPlatformAdminSettings?.userGlobalRoleChanged?.email || false,
            label: t('pages.userNotificationsSettings.platformAdmin.settings.adminUserGlobalRoleChanged'),
          },
          spaceCreated: {
            checked: currentPlatformAdminSettings?.spaceCreated?.email || false,
            label: t('pages.userNotificationsSettings.platformAdmin.settings.adminSpaceCreated'),
          },
        }}
        onChange={onUpdateSettings}
      />
    </PageContentBlock>
  );
};
