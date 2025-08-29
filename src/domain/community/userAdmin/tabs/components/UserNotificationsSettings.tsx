import { useTranslation } from 'react-i18next';
import { BlockTitle, Caption } from '@/core/ui/typography/components';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import SwitchSettingsGroup from '@/core/ui/forms/SettingsGroups/SwitchSettingsGroup';
import { UserNotificationSettings } from '@/domain/community/userAdmin/tabs/model/NotificationSettings.model';

interface UserNotificationsSettingsProps {
  currentUserSettings: UserNotificationSettings | undefined;
  onUpdateSettings: (property: string, value: boolean) => void;
}

export const UserNotificationsSettings = ({
  currentUserSettings,
  onUpdateSettings,
}: UserNotificationsSettingsProps) => {
  const { t } = useTranslation();

  return (
    <PageContentBlock>
      <BlockTitle>{t('pages.userNotificationsSettings.user.title')}</BlockTitle>
      <Caption>{t('pages.userNotificationsSettings.user.subtitle')}</Caption>
      <SwitchSettingsGroup
        options={{
          commentReply: {
            checked: currentUserSettings?.commentReply?.email || false,
            label: t('pages.userNotificationsSettings.user.settings.commentReply'),
          },
          mentioned: {
            checked: currentUserSettings?.mentioned?.email || false,
            label: t('pages.userNotificationsSettings.user.settings.mentioned'),
          },
          messageReceived: {
            checked: currentUserSettings?.messageReceived?.email || false,
            label: t('pages.userNotificationsSettings.user.settings.messageReceived'),
          },
          copyOfMessageSent: {
            checked: currentUserSettings?.copyOfMessageSent?.email || false,
            label: t('pages.userNotificationsSettings.user.settings.copyOfMessageSent'),
          },
        }}
        onChange={onUpdateSettings}
      />
    </PageContentBlock>
  );
};
