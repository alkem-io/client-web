import { useTranslation } from 'react-i18next';
import { BlockTitle, Caption } from '@/core/ui/typography/components';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import DualSwitchSettingsGroup from '@/core/ui/forms/SettingsGroups/DualSwitchSettingsGroup';
import { UserNotificationSettings } from '@/domain/community/userAdmin/tabs/model/NotificationSettings.model';
import { NotificationValidationType } from '@/core/ui/forms/SettingsGroups/types/NotificationTypes';

interface CombinedUserNotificationsSettingsProps {
  currentUserSettings: UserNotificationSettings | undefined;
  onUpdateSettings: (property: string, type: 'inApp' | 'email', value: boolean) => Promise<void>;
}

export const CombinedUserNotificationsSettings = ({
  currentUserSettings,
  onUpdateSettings,
}: CombinedUserNotificationsSettingsProps) => {
  const { t } = useTranslation();

  const userOptions = {
    // User interaction notifications
    commentReply: {
      inAppChecked: currentUserSettings?.commentReply?.inApp || false,
      emailChecked: currentUserSettings?.commentReply?.email || false,
      label: t('pages.userNotificationsSettings.user.settings.commentReply'),
    },
    mentioned: {
      inAppChecked: currentUserSettings?.mentioned?.inApp || false,
      emailChecked: currentUserSettings?.mentioned?.email || false,
      label: t('pages.userNotificationsSettings.user.settings.mentioned'),
    },
    messageReceived: {
      inAppChecked: currentUserSettings?.messageReceived?.inApp || false,
      emailChecked: currentUserSettings?.messageReceived?.email || false,
      label: t('pages.userNotificationsSettings.user.settings.messageReceived'),
      validationRules: [
        {
          type: NotificationValidationType.LOCKED,
          message: t('pages.userNotificationsSettings.tooltips.messageReceived'),
        },
      ],
    },
    // User membership notifications
    'membership.spaceCommunityInvitationReceived': {
      inAppChecked: currentUserSettings?.membership?.spaceCommunityInvitationReceived?.inApp || false,
      emailChecked: currentUserSettings?.membership?.spaceCommunityInvitationReceived?.email || false,
      label: t('pages.userNotificationsSettings.userMembership.settings.spaceCommunityInvitation'),
      validationRules: [
        {
          type: NotificationValidationType.LOCKED,
          message: t('pages.userNotificationsSettings.tooltips.spaceCommunityInvitationReceived'),
        },
      ],
    },
    'membership.spaceCommunityJoined': {
      inAppChecked: currentUserSettings?.membership?.spaceCommunityJoined?.inApp || false,
      emailChecked: currentUserSettings?.membership?.spaceCommunityJoined?.email || false,
      label: t('pages.userNotificationsSettings.userMembership.settings.spaceCommunityJoined'),
    },
  };

  return (
    <PageContentBlock>
      <BlockTitle>{t('pages.userNotificationsSettings.user.title')}</BlockTitle>
      <Caption>{t('pages.userNotificationsSettings.user.subtitle')}</Caption>
      <DualSwitchSettingsGroup options={userOptions} onChange={onUpdateSettings} />
    </PageContentBlock>
  );
};
