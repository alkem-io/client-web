import { useTranslation } from 'react-i18next';
import { BlockTitle, Caption } from '@/core/ui/typography/components';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { Divider } from '@mui/material';
import DualSwitchSettingsGroup from '@/core/ui/forms/SettingsGroups/DualSwitchSettingsGroup';
import {
  PlatformNotificationSettings,
  PlatformAdminNotificationSettings,
} from '@/domain/community/userAdmin/tabs/model/NotificationSettings.model';
import { ReactNode } from 'react';

interface CombinedPlatformNotificationsSettingsProps {
  currentPlatformSettings: PlatformNotificationSettings | undefined;
  currentPlatformAdminSettings: PlatformAdminNotificationSettings | undefined;
  onUpdatePlatformSettings: (property: string, type: 'inApp' | 'email', value: boolean) => Promise<void>;
  onUpdatePlatformAdminSettings: (property: string, type: 'inApp' | 'email', value: boolean) => Promise<void>;
  isPlatformAdmin: boolean;
}

type NotificationOption = {
  inAppChecked: boolean;
  emailChecked: boolean;
  label: ReactNode;
  disabled?: boolean;
};

export const CombinedPlatformNotificationsSettings = ({
  currentPlatformSettings,
  currentPlatformAdminSettings,
  onUpdatePlatformSettings,
  onUpdatePlatformAdminSettings,
  isPlatformAdmin,
}: CombinedPlatformNotificationsSettingsProps) => {
  const { t } = useTranslation();

  // Build options object with consistent typing matching DualSwitchSettingsGroup's expected type
  const buildOptions = (): Record<string, NotificationOption> => {
    const options: Record<string, NotificationOption> = {
      // Forum notifications (always visible)
      forumDiscussionComment: {
        inAppChecked: currentPlatformSettings?.forumDiscussionComment?.inApp || false,
        emailChecked: currentPlatformSettings?.forumDiscussionComment?.email || false,
        label: t('pages.userNotificationsSettings.forum.settings.forumDiscussionComment'),
      },
      forumDiscussionCreated: {
        inAppChecked: currentPlatformSettings?.forumDiscussionCreated?.inApp || false,
        emailChecked: currentPlatformSettings?.forumDiscussionCreated?.email || false,
        label: t('pages.userNotificationsSettings.forum.settings.forumDiscussionCreated'),
      },
    };

    // Add platform admin notifications only if user is platform admin
    if (isPlatformAdmin) {
      options.userProfileCreated = {
        inAppChecked: currentPlatformAdminSettings?.userProfileCreated?.inApp || false,
        emailChecked: currentPlatformAdminSettings?.userProfileCreated?.email || false,
        label: t('pages.userNotificationsSettings.platformAdmin.settings.adminUserProfileCreated'),
      };

      options.userProfileRemoved = {
        inAppChecked: currentPlatformAdminSettings?.userProfileRemoved?.inApp || false,
        emailChecked: currentPlatformAdminSettings?.userProfileRemoved?.email || false,
        label: t('pages.userNotificationsSettings.platformAdmin.settings.adminUserProfileRemoved'),
      };

      options.userGlobalRoleChanged = {
        inAppChecked: currentPlatformAdminSettings?.userGlobalRoleChanged?.inApp || false,
        emailChecked: currentPlatformAdminSettings?.userGlobalRoleChanged?.email || false,
        label: t('pages.userNotificationsSettings.platformAdmin.settings.adminUserGlobalRoleChanged'),
      };

      options.spaceCreated = {
        inAppChecked: currentPlatformAdminSettings?.spaceCreated?.inApp || false,
        emailChecked: currentPlatformAdminSettings?.spaceCreated?.email || false,
        label: t('pages.userNotificationsSettings.platformAdmin.settings.adminSpaceCreated'),
      };
    }

    return options;
  };

  const allOptions = buildOptions();

  // Create wrapper functions to match DualSwitchSettingsGroup's expected signature
  const handlePlatformSettingsChange = (key: string | number, type: 'inApp' | 'email', newValue: boolean) => {
    return onUpdatePlatformSettings(String(key), type, newValue);
  };

  const handlePlatformAdminSettingsChange = (key: string | number, type: 'inApp' | 'email', newValue: boolean) => {
    return onUpdatePlatformAdminSettings(String(key), type, newValue);
  };

  return (
    <PageContentBlock>
      <BlockTitle>{t('pages.userNotificationsSettings.platformAdmin.title')}</BlockTitle>
      <Caption>{t('pages.userNotificationsSettings.forum.subtitle')}</Caption>

      {/* Forum notifications (always visible) */}
      <DualSwitchSettingsGroup
        options={Object.fromEntries(
          Object.entries(allOptions).filter(
            ([key]) =>
              !['userProfileCreated', 'userProfileRemoved', 'userGlobalRoleChanged', 'spaceCreated'].includes(key)
          )
        )}
        onChange={handlePlatformSettingsChange}
      />

      {/* Divider and platform admin settings */}
      {isPlatformAdmin && (
        <>
          <Divider />
          <Caption>{t('pages.userNotificationsSettings.platformAdmin.subtitle')}</Caption>
          <DualSwitchSettingsGroup
            options={Object.fromEntries(
              Object.entries(allOptions).filter(([key]) =>
                ['userProfileCreated', 'userProfileRemoved', 'userGlobalRoleChanged', 'spaceCreated'].includes(key)
              )
            )}
            onChange={handlePlatformAdminSettingsChange}
          />
        </>
      )}
    </PageContentBlock>
  );
};
