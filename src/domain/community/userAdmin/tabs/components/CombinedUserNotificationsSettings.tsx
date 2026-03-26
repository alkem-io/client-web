import { useTranslation } from 'react-i18next';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import TripleSwitchSettingsGroup from '@/core/ui/forms/SettingsGroups/TripleSwitchSettingsGroup';
import { type ChannelType, NotificationValidationType } from '@/core/ui/forms/SettingsGroups/types/NotificationTypes';
import { BlockTitle, Caption } from '@/core/ui/typography/components';
import type { UserNotificationSettings } from '@/domain/community/userAdmin/tabs/model/NotificationSettings.model';

interface CombinedUserNotificationsSettingsProps {
  currentUserSettings: UserNotificationSettings | undefined;
  onUpdateSettings: (property: string, type: ChannelType, value: boolean) => Promise<void>;
  isPushEnabled: boolean;
  isPushAvailable: boolean;
}

export const CombinedUserNotificationsSettings = ({
  currentUserSettings,
  onUpdateSettings,
  isPushEnabled,
  isPushAvailable,
}: CombinedUserNotificationsSettingsProps) => {
  const { t } = useTranslation();

  const userOptions = {
    commentReply: {
      inAppChecked: currentUserSettings?.commentReply?.inApp || false,
      emailChecked: currentUserSettings?.commentReply?.email || false,
      pushChecked: currentUserSettings?.commentReply?.push || false,
      label: t('pages.userNotificationsSettings.user.settings.commentReply'),
    },
    mentioned: {
      inAppChecked: currentUserSettings?.mentioned?.inApp || false,
      emailChecked: currentUserSettings?.mentioned?.email || false,
      pushChecked: currentUserSettings?.mentioned?.push || false,
      label: t('pages.userNotificationsSettings.user.settings.mentioned'),
    },
    messageReceived: {
      inAppChecked: currentUserSettings?.messageReceived?.inApp || false,
      emailChecked: currentUserSettings?.messageReceived?.email || false,
      pushChecked: currentUserSettings?.messageReceived?.push || false,
      label: t('pages.userNotificationsSettings.user.settings.messageReceived'),
      validationRules: [
        {
          type: NotificationValidationType.LOCKED,
          message: t('pages.userNotificationsSettings.tooltips.messageReceived'),
        },
      ],
    },
    'membership.spaceCommunityInvitationReceived': {
      inAppChecked: currentUserSettings?.membership?.spaceCommunityInvitationReceived?.inApp || false,
      emailChecked: currentUserSettings?.membership?.spaceCommunityInvitationReceived?.email || false,
      pushChecked: currentUserSettings?.membership?.spaceCommunityInvitationReceived?.push || false,
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
      pushChecked: currentUserSettings?.membership?.spaceCommunityJoined?.push || false,
      label: t('pages.userNotificationsSettings.userMembership.settings.spaceCommunityJoined'),
    },
  };

  return (
    <PageContentBlock>
      <BlockTitle>{t('pages.userNotificationsSettings.user.title')}</BlockTitle>
      <Caption>{t('pages.userNotificationsSettings.user.subtitle')}</Caption>
      <TripleSwitchSettingsGroup
        options={userOptions}
        onChange={onUpdateSettings}
        isPushEnabled={isPushEnabled}
        isPushAvailable={isPushAvailable}
      />
    </PageContentBlock>
  );
};
