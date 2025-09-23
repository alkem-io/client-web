import { useTranslation } from 'react-i18next';
import { BlockTitle, Caption } from '@/core/ui/typography/components';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { Divider } from '@mui/material';
import DualSwitchSettingsGroup from '@/core/ui/forms/SettingsGroups/DualSwitchSettingsGroup';
import {
  SpaceNotificationSettings,
  SpaceAdminNotificationSettings,
} from '@/domain/community/userAdmin/tabs/model/NotificationSettings.model';
import { ReactNode } from 'react';

interface CombinedSpaceNotificationsSettingsProps {
  currentSpaceSettings: SpaceNotificationSettings | undefined;
  currentSpaceAdminSettings: SpaceAdminNotificationSettings | undefined;
  onUpdateSettings: (property: string, type: 'inApp' | 'email', value: boolean) => void;
  onUpdateSpaceAdminSettings: (property: string, type: 'inApp' | 'email', value: boolean) => void;
  showSpaceAdminSettings: boolean;
}

type NotificationOption = {
  inAppChecked: boolean;
  emailChecked: boolean;
  label: ReactNode;
  disabled?: boolean;
};

export const CombinedSpaceNotificationsSettings = ({
  currentSpaceSettings,
  currentSpaceAdminSettings,
  onUpdateSettings,
  onUpdateSpaceAdminSettings,
  showSpaceAdminSettings,
}: CombinedSpaceNotificationsSettingsProps) => {
  const { t } = useTranslation();

  // Build options object with consistent typing
  const buildOptions = (): Record<string, NotificationOption> => {
    const options: Record<string, NotificationOption> = {
      // Regular space notifications
      collaborationCalloutPublished: {
        inAppChecked: currentSpaceSettings?.collaborationCalloutPublished?.inApp || false,
        emailChecked: currentSpaceSettings?.collaborationCalloutPublished?.email || false,
        label: t('pages.userNotificationsSettings.space.settings.collaborationCalloutPublished'),
      },
      collaborationCalloutPostContributionComment: {
        inAppChecked: currentSpaceSettings?.collaborationCalloutPostContributionComment?.inApp || false,
        emailChecked: currentSpaceSettings?.collaborationCalloutPostContributionComment?.email || false,
        label: t('pages.userNotificationsSettings.space.settings.collaborationCalloutPostContributionComment'),
      },
      collaborationCalloutContributionCreated: {
        inAppChecked: currentSpaceSettings?.collaborationCalloutContributionCreated?.inApp || false,
        emailChecked: currentSpaceSettings?.collaborationCalloutContributionCreated?.email || false,
        label: t('pages.userNotificationsSettings.space.settings.collaborationCalloutContributionCreated'),
      },
      collaborationCalloutComment: {
        inAppChecked: currentSpaceSettings?.collaborationCalloutComment?.inApp || false,
        emailChecked: currentSpaceSettings?.collaborationCalloutComment?.email || false,
        label: t('pages.userNotificationsSettings.space.settings.collaborationCalloutComment'),
      },
      communicationUpdates: {
        inAppChecked: currentSpaceSettings?.communicationUpdates?.inApp || false,
        emailChecked: currentSpaceSettings?.communicationUpdates?.email || false,
        label: t('pages.userNotificationsSettings.space.settings.communicationUpdateSent'),
      },
    };

    // Add space admin notifications if user has admin privileges
    if (showSpaceAdminSettings) {
      // Add a separator item for visual distinction
      options.adminSeparator = {
        inAppChecked: false,
        emailChecked: false,
        label: '', // Empty label for the divider
        disabled: true,
      };

      options.communityApplicationReceived = {
        inAppChecked: currentSpaceAdminSettings?.communityApplicationReceived?.inApp || false,
        emailChecked: currentSpaceAdminSettings?.communityApplicationReceived?.email || false,
        label: t('pages.userNotificationsSettings.spaceAdmin.settings.communityApplicationReceived'),
      };

      options.communityNewMember = {
        inAppChecked: currentSpaceAdminSettings?.communityNewMember?.inApp || false,
        emailChecked: currentSpaceAdminSettings?.communityNewMember?.email || false,
        label: t('pages.userNotificationsSettings.spaceAdmin.settings.communityNewMember'),
      };

      options.spaceAdminCollaborationCalloutContributionCreated = {
        inAppChecked: currentSpaceAdminSettings?.collaborationCalloutContributionCreated?.inApp || false,
        emailChecked: currentSpaceAdminSettings?.collaborationCalloutContributionCreated?.email || false,
        label: t('pages.userNotificationsSettings.spaceAdmin.settings.collaborationCalloutContributionCreated'),
      };

      options.communicationMessageReceived = {
        inAppChecked: currentSpaceAdminSettings?.communicationMessageReceived?.inApp || false,
        emailChecked: currentSpaceAdminSettings?.communicationMessageReceived?.email || false,
        label: t('pages.userNotificationsSettings.spaceAdmin.settings.communicationMessageReceived'),
      };
    }

    return options;
  };

  const allOptions = buildOptions();

  // Create wrapper functions to match DualSwitchSettingsGroup's expected signature
  const handleSpaceSettingsChange = (key: string | number, type: 'inApp' | 'email', newValue: boolean) => {
    onUpdateSettings(String(key), type, newValue);
  };

  const handleSpaceAdminSettingsChange = (key: string | number, type: 'inApp' | 'email', newValue: boolean) => {
    // Handle the prefixed key mapping for space admin settings
    const keyStr = String(key);
    const originalKey =
      keyStr === 'spaceAdminCollaborationCalloutContributionCreated'
        ? 'collaborationCalloutContributionCreated'
        : keyStr;
    onUpdateSpaceAdminSettings(originalKey, type, newValue);
  };

  return (
    <PageContentBlock>
      <BlockTitle>{t('pages.userNotificationsSettings.space.title')}</BlockTitle>
      <Caption>{t('pages.userNotificationsSettings.space.subtitle')}</Caption>

      {/* Regular space settings */}
      <DualSwitchSettingsGroup
        options={Object.fromEntries(
          Object.entries(allOptions).filter(
            ([key]) =>
              ![
                'adminSeparator',
                'communityApplicationReceived',
                'communityNewMember',
                'spaceAdminCollaborationCalloutContributionCreated',
                'communicationMessageReceived',
              ].includes(key)
          )
        )}
        onChange={handleSpaceSettingsChange}
      />

      {/* Divider and space admin settings */}
      {showSpaceAdminSettings && (
        <>
          <Divider sx={{ my: 3 }} />
          <Caption>{t('pages.userNotificationsSettings.spaceAdmin.subtitle')}</Caption>
          <DualSwitchSettingsGroup
            options={Object.fromEntries(
              Object.entries(allOptions).filter(([key]) =>
                [
                  'communityApplicationReceived',
                  'communityNewMember',
                  'spaceAdminCollaborationCalloutContributionCreated',
                  'communicationMessageReceived',
                ].includes(key)
              )
            )}
            onChange={handleSpaceAdminSettingsChange}
          />
        </>
      )}
    </PageContentBlock>
  );
};
