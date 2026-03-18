import { Divider } from '@mui/material';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import TripleSwitchSettingsGroup from '@/core/ui/forms/SettingsGroups/TripleSwitchSettingsGroup';
import type { ChannelType } from '@/core/ui/forms/SettingsGroups/types/NotificationTypes';
import { BlockTitle, Caption } from '@/core/ui/typography/components';
import type {
  PlatformAdminNotificationSettings,
  PlatformNotificationSettings,
} from '@/domain/community/userAdmin/tabs/model/NotificationSettings.model';

interface CombinedPlatformNotificationsSettingsProps {
  currentPlatformSettings: PlatformNotificationSettings | undefined;
  currentPlatformAdminSettings: PlatformAdminNotificationSettings | undefined;
  onUpdatePlatformSettings: (property: string, type: ChannelType, value: boolean) => Promise<void>;
  onUpdatePlatformAdminSettings: (property: string, type: ChannelType, value: boolean) => Promise<void>;
  isPlatformAdmin: boolean;
  isPushEnabled: boolean;
  isPushAvailable: boolean;
}

type NotificationOption = {
  inAppChecked: boolean;
  emailChecked: boolean;
  pushChecked: boolean;
  label: ReactNode;
  disabled?: boolean;
};

export const CombinedPlatformNotificationsSettings = ({
  currentPlatformSettings,
  currentPlatformAdminSettings,
  onUpdatePlatformSettings,
  onUpdatePlatformAdminSettings,
  isPlatformAdmin,
  isPushEnabled,
  isPushAvailable,
}: CombinedPlatformNotificationsSettingsProps) => {
  const { t } = useTranslation();

  const buildOptions = (): Record<string, NotificationOption> => {
    const options: Record<string, NotificationOption> = {
      forumDiscussionComment: {
        inAppChecked: currentPlatformSettings?.forumDiscussionComment?.inApp || false,
        emailChecked: currentPlatformSettings?.forumDiscussionComment?.email || false,
        pushChecked: currentPlatformSettings?.forumDiscussionComment?.push || false,
        label: t('pages.userNotificationsSettings.forum.settings.forumDiscussionComment'),
      },
      forumDiscussionCreated: {
        inAppChecked: currentPlatformSettings?.forumDiscussionCreated?.inApp || false,
        emailChecked: currentPlatformSettings?.forumDiscussionCreated?.email || false,
        pushChecked: currentPlatformSettings?.forumDiscussionCreated?.push || false,
        label: t('pages.userNotificationsSettings.forum.settings.forumDiscussionCreated'),
      },
    };

    if (isPlatformAdmin) {
      options.userProfileCreated = {
        inAppChecked: currentPlatformAdminSettings?.userProfileCreated?.inApp || false,
        emailChecked: currentPlatformAdminSettings?.userProfileCreated?.email || false,
        pushChecked: currentPlatformAdminSettings?.userProfileCreated?.push || false,
        label: t('pages.userNotificationsSettings.platformAdmin.settings.adminUserProfileCreated'),
      };

      options.userProfileRemoved = {
        inAppChecked: currentPlatformAdminSettings?.userProfileRemoved?.inApp || false,
        emailChecked: currentPlatformAdminSettings?.userProfileRemoved?.email || false,
        pushChecked: currentPlatformAdminSettings?.userProfileRemoved?.push || false,
        label: t('pages.userNotificationsSettings.platformAdmin.settings.adminUserProfileRemoved'),
      };

      options.userGlobalRoleChanged = {
        inAppChecked: currentPlatformAdminSettings?.userGlobalRoleChanged?.inApp || false,
        emailChecked: currentPlatformAdminSettings?.userGlobalRoleChanged?.email || false,
        pushChecked: currentPlatformAdminSettings?.userGlobalRoleChanged?.push || false,
        label: t('pages.userNotificationsSettings.platformAdmin.settings.adminUserGlobalRoleChanged'),
      };

      options.spaceCreated = {
        inAppChecked: currentPlatformAdminSettings?.spaceCreated?.inApp || false,
        emailChecked: currentPlatformAdminSettings?.spaceCreated?.email || false,
        pushChecked: currentPlatformAdminSettings?.spaceCreated?.push || false,
        label: t('pages.userNotificationsSettings.platformAdmin.settings.adminSpaceCreated'),
      };
    }

    return options;
  };

  const allOptions = buildOptions();

  const handlePlatformSettingsChange = (key: string | number, type: ChannelType, newValue: boolean) => {
    return onUpdatePlatformSettings(String(key), type, newValue);
  };

  const handlePlatformAdminSettingsChange = (key: string | number, type: ChannelType, newValue: boolean) => {
    return onUpdatePlatformAdminSettings(String(key), type, newValue);
  };

  return (
    <PageContentBlock>
      <BlockTitle>{t('pages.userNotificationsSettings.platformAdmin.title')}</BlockTitle>
      <Caption>{t('pages.userNotificationsSettings.forum.subtitle')}</Caption>

      <TripleSwitchSettingsGroup
        options={Object.fromEntries(
          Object.entries(allOptions).filter(
            ([key]) =>
              !['userProfileCreated', 'userProfileRemoved', 'userGlobalRoleChanged', 'spaceCreated'].includes(key)
          )
        )}
        onChange={handlePlatformSettingsChange}
        isPushEnabled={isPushEnabled}
        isPushAvailable={isPushAvailable}
      />

      {isPlatformAdmin && (
        <>
          <Divider />
          <Caption>{t('pages.userNotificationsSettings.platformAdmin.subtitle')}</Caption>
          <TripleSwitchSettingsGroup
            options={Object.fromEntries(
              Object.entries(allOptions).filter(([key]) =>
                ['userProfileCreated', 'userProfileRemoved', 'userGlobalRoleChanged', 'spaceCreated'].includes(key)
              )
            )}
            onChange={handlePlatformAdminSettingsChange}
            isPushEnabled={isPushEnabled}
            isPushAvailable={isPushAvailable}
          />
        </>
      )}
    </PageContentBlock>
  );
};
