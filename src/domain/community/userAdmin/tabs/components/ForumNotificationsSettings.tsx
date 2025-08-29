import { useTranslation } from 'react-i18next';
import { BlockTitle, Caption } from '@/core/ui/typography/components';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import SwitchSettingsGroup from '@/core/ui/forms/SettingsGroups/SwitchSettingsGroup';
import { PlatformNotificationSettings } from '@/domain/community/userAdmin/tabs/model/NotificationSettings.model';

interface ForumNotificationsSettingsProps {
  currentPlatformSettings: PlatformNotificationSettings | undefined;
  onUpdateSettings: (property: string, value: boolean) => void;
}

export const ForumNotificationsSettings = ({
  currentPlatformSettings,
  onUpdateSettings,
}: ForumNotificationsSettingsProps) => {
  const { t } = useTranslation();

  return (
    <PageContentBlock>
      <BlockTitle>{t('pages.userNotificationsSettings.forum.title')}</BlockTitle>
      <Caption>{t('pages.userNotificationsSettings.forum.subtitle')}</Caption>
      <SwitchSettingsGroup
        options={{
          forumDiscussionComment: {
            checked: currentPlatformSettings?.forumDiscussionComment?.email || false,
            label: t('pages.userNotificationsSettings.forum.settings.forumDiscussionComment'),
          },
          forumDiscussionCreated: {
            checked: currentPlatformSettings?.forumDiscussionCreated?.email || false,
            label: t('pages.userNotificationsSettings.forum.settings.forumDiscussionCreated'),
          },
        }}
        onChange={onUpdateSettings}
      />
    </PageContentBlock>
  );
};
