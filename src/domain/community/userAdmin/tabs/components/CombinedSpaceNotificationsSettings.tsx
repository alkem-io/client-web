import { Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import TripleSwitchSettingsGroup from '@/core/ui/forms/SettingsGroups/TripleSwitchSettingsGroup';
import {
  type NotificationOption,
  NotificationValidationType,
  type ChannelType,
} from '@/core/ui/forms/SettingsGroups/types/NotificationTypes';
import { BlockTitle, Caption } from '@/core/ui/typography/components';
import type {
  SpaceAdminNotificationSettings,
  SpaceNotificationSettings,
} from '@/domain/community/userAdmin/tabs/model/NotificationSettings.model';

interface CombinedSpaceNotificationsSettingsProps {
  currentSpaceSettings: SpaceNotificationSettings | undefined;
  currentSpaceAdminSettings: SpaceAdminNotificationSettings | undefined;
  onUpdateSettings: (property: string, type: ChannelType, value: boolean) => Promise<void>;
  onUpdateSpaceAdminSettings: (property: string, type: ChannelType, value: boolean) => Promise<void>;
  showSpaceAdminSettings: boolean;
  isPushEnabled: boolean;
  isPushAvailable: boolean;
}

export const CombinedSpaceNotificationsSettings = ({
  currentSpaceSettings,
  currentSpaceAdminSettings,
  onUpdateSettings,
  onUpdateSpaceAdminSettings,
  showSpaceAdminSettings,
  isPushEnabled,
  isPushAvailable,
}: CombinedSpaceNotificationsSettingsProps) => {
  const { t } = useTranslation();

  const buildOptions = (): Record<string, NotificationOption> => {
    const options: Record<string, NotificationOption> = {
      collaborationCalloutPublished: {
        inAppChecked: currentSpaceSettings?.collaborationCalloutPublished?.inApp || false,
        emailChecked: currentSpaceSettings?.collaborationCalloutPublished?.email || false,
        pushChecked: currentSpaceSettings?.collaborationCalloutPublished?.push || false,
        label: t('pages.userNotificationsSettings.space.settings.collaborationCalloutPublished'),
      },
      collaborationCalloutPostContributionComment: {
        inAppChecked: currentSpaceSettings?.collaborationCalloutPostContributionComment?.inApp || false,
        emailChecked: currentSpaceSettings?.collaborationCalloutPostContributionComment?.email || false,
        pushChecked: currentSpaceSettings?.collaborationCalloutPostContributionComment?.push || false,
        label: t('pages.userNotificationsSettings.space.settings.collaborationCalloutPostContributionComment'),
      },
      collaborationCalloutContributionCreated: {
        inAppChecked: currentSpaceSettings?.collaborationCalloutContributionCreated?.inApp || false,
        emailChecked: currentSpaceSettings?.collaborationCalloutContributionCreated?.email || false,
        pushChecked: currentSpaceSettings?.collaborationCalloutContributionCreated?.push || false,
        label: t('pages.userNotificationsSettings.space.settings.collaborationCalloutContributionCreated'),
      },
      collaborationCalloutComment: {
        inAppChecked: currentSpaceSettings?.collaborationCalloutComment?.inApp || false,
        emailChecked: currentSpaceSettings?.collaborationCalloutComment?.email || false,
        pushChecked: currentSpaceSettings?.collaborationCalloutComment?.push || false,
        label: t('pages.userNotificationsSettings.space.settings.collaborationCalloutComment'),
      },
      communicationUpdates: {
        inAppChecked: currentSpaceSettings?.communicationUpdates?.inApp || false,
        emailChecked: currentSpaceSettings?.communicationUpdates?.email || false,
        pushChecked: currentSpaceSettings?.communicationUpdates?.push || false,
        label: t('pages.userNotificationsSettings.space.settings.communicationUpdateSent'),
      },
      communityCalendarEvents: {
        inAppChecked: currentSpaceSettings?.communityCalendarEvents?.inApp || false,
        emailChecked: currentSpaceSettings?.communityCalendarEvents?.email || false,
        pushChecked: currentSpaceSettings?.communityCalendarEvents?.push || false,
        label: t('pages.userNotificationsSettings.space.settings.communityCalendarEvents'),
      },
      collaborationPollVoteCastOnOwnPoll: {
        inAppChecked: currentSpaceSettings?.collaborationPollVoteCastOnOwnPoll?.inApp || false,
        emailChecked: currentSpaceSettings?.collaborationPollVoteCastOnOwnPoll?.email || false,
        pushChecked: currentSpaceSettings?.collaborationPollVoteCastOnOwnPoll?.push || false,
        label: t('pages.userNotificationsSettings.space.settings.collaborationPollVoteCastOnOwnPoll'),
      },
      collaborationPollVoteCastOnPollIVotedOn: {
        inAppChecked: currentSpaceSettings?.collaborationPollVoteCastOnPollIVotedOn?.inApp || false,
        emailChecked: currentSpaceSettings?.collaborationPollVoteCastOnPollIVotedOn?.email || false,
        pushChecked: currentSpaceSettings?.collaborationPollVoteCastOnPollIVotedOn?.push || false,
        label: t('pages.userNotificationsSettings.space.settings.collaborationPollVoteCastOnPollIVotedOn'),
      },
      collaborationPollModifiedOnPollIVotedOn: {
        inAppChecked: currentSpaceSettings?.collaborationPollModifiedOnPollIVotedOn?.inApp || false,
        emailChecked: currentSpaceSettings?.collaborationPollModifiedOnPollIVotedOn?.email || false,
        pushChecked: currentSpaceSettings?.collaborationPollModifiedOnPollIVotedOn?.push || false,
        label: t('pages.userNotificationsSettings.space.settings.collaborationPollModifiedOnPollIVotedOn'),
      },
      collaborationPollVoteAffectedByOptionChange: {
        inAppChecked: currentSpaceSettings?.collaborationPollVoteAffectedByOptionChange?.inApp || false,
        emailChecked: currentSpaceSettings?.collaborationPollVoteAffectedByOptionChange?.email || false,
        pushChecked: currentSpaceSettings?.collaborationPollVoteAffectedByOptionChange?.push || false,
        label: t('pages.userNotificationsSettings.space.settings.collaborationPollVoteAffectedByOptionChange'),
      },
    };

    if (showSpaceAdminSettings) {
      options.adminSeparator = {
        inAppChecked: false,
        emailChecked: false,
        pushChecked: false,
        label: '',
      };

      options.communityApplicationReceived = {
        inAppChecked: currentSpaceAdminSettings?.communityApplicationReceived?.inApp || false,
        emailChecked: currentSpaceAdminSettings?.communityApplicationReceived?.email || false,
        pushChecked: currentSpaceAdminSettings?.communityApplicationReceived?.push || false,
        label: t('pages.userNotificationsSettings.spaceAdmin.settings.communityApplicationReceived'),
        validationRules: [
          {
            type: NotificationValidationType.EMAIL_LOCKED,
            message: t('pages.userNotificationsSettings.tooltips.communityApplicationReceived'),
          },
        ],
      };

      options.communityNewMember = {
        inAppChecked: currentSpaceAdminSettings?.communityNewMember?.inApp || false,
        emailChecked: currentSpaceAdminSettings?.communityNewMember?.email || false,
        pushChecked: currentSpaceAdminSettings?.communityNewMember?.push || false,
        label: t('pages.userNotificationsSettings.spaceAdmin.settings.communityNewMember'),
        validationRules: [
          {
            type: NotificationValidationType.REQUIRE_AT_LEAST_ONE,
            message: t('pages.userNotificationsSettings.tooltips.communityNewMember'),
          },
        ],
      };

      options.spaceAdminCollaborationCalloutContributionCreated = {
        inAppChecked: currentSpaceAdminSettings?.collaborationCalloutContributionCreated?.inApp || false,
        emailChecked: currentSpaceAdminSettings?.collaborationCalloutContributionCreated?.email || false,
        pushChecked: currentSpaceAdminSettings?.collaborationCalloutContributionCreated?.push || false,
        label: t('pages.userNotificationsSettings.spaceAdmin.settings.collaborationCalloutContributionCreated'),
      };

      options.communicationMessageReceived = {
        inAppChecked: currentSpaceAdminSettings?.communicationMessageReceived?.inApp || false,
        emailChecked: currentSpaceAdminSettings?.communicationMessageReceived?.email || false,
        pushChecked: currentSpaceAdminSettings?.communicationMessageReceived?.push || false,
        label: t('pages.userNotificationsSettings.spaceAdmin.settings.communicationMessageReceived'),
        validationRules: [
          {
            type: NotificationValidationType.LOCKED,
            message: t('pages.userNotificationsSettings.tooltips.communicationMessageReceived'),
          },
        ],
      };
    }

    return options;
  };

  const allOptions = buildOptions();

  const handleSpaceSettingsChange = (key: string | number, type: ChannelType, newValue: boolean) => {
    return onUpdateSettings(String(key), type, newValue);
  };

  const handleSpaceAdminSettingsChange = (key: string | number, type: ChannelType, newValue: boolean) => {
    const keyStr = String(key);
    const originalKey =
      keyStr === 'spaceAdminCollaborationCalloutContributionCreated'
        ? 'collaborationCalloutContributionCreated'
        : keyStr;
    return onUpdateSpaceAdminSettings(originalKey, type, newValue);
  };

  return (
    <PageContentBlock>
      <BlockTitle>{t('pages.userNotificationsSettings.space.title')}</BlockTitle>
      <Caption>{t('pages.userNotificationsSettings.space.subtitle')}</Caption>

      <TripleSwitchSettingsGroup
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
        isPushEnabled={isPushEnabled}
        isPushAvailable={isPushAvailable}
      />

      {showSpaceAdminSettings && (
        <>
          <Divider />
          <Caption>{t('pages.userNotificationsSettings.spaceAdmin.subtitle')}</Caption>
          <TripleSwitchSettingsGroup
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
            isPushEnabled={isPushEnabled}
            isPushAvailable={isPushAvailable}
          />
        </>
      )}
    </PageContentBlock>
  );
};
