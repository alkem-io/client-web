import { useTranslation } from 'react-i18next';
import { BlockTitle, Caption } from '@/core/ui/typography/components';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import SwitchSettingsGroup from '@/core/ui/forms/SettingsGroups/SwitchSettingsGroup';
import { UserNotificationSettings } from '@/domain/community/userAdmin/tabs/model/NotificationSettings.model';

interface UserMembershipNotificationsSettingsProps {
  currentUserSettings: UserNotificationSettings | undefined;
  onUpdateSettings: (property: string, value: boolean) => void;
}

export const UserMembershipNotificationsSettings = ({
  currentUserSettings,
  onUpdateSettings,
}: UserMembershipNotificationsSettingsProps) => {
  const { t } = useTranslation();

  return (
    <PageContentBlock>
      <BlockTitle>{t('pages.userNotificationsSettings.userMembership.title')}</BlockTitle>
      <Caption>{t('pages.userNotificationsSettings.userMembership.subtitle')}</Caption>
      <SwitchSettingsGroup
        options={{
          spaceCommunityInvitationReceived: {
            checked: currentUserSettings?.membership?.spaceCommunityInvitationReceived?.email || false,
            label: t('pages.userNotificationsSettings.userMembership.settings.spaceCommunityInvitation'),
          },
          spaceCommunityJoined: {
            checked: currentUserSettings?.membership?.spaceCommunityJoined?.email || false,
            label: t('pages.userNotificationsSettings.userMembership.settings.spaceCommunityJoined'),
          },
          spaceCommunityApplicationSubmitted: {
            checked: currentUserSettings?.membership?.spaceCommunityApplicationSubmitted?.email || false,
            label: t('pages.userNotificationsSettings.userMembership.settings.spaceCommunityApplication'),
          },
        }}
        onChange={(property, value) => onUpdateSettings(`membership.${property}`, value)}
      />
    </PageContentBlock>
  );
};
