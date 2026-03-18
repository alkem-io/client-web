import { useTranslation } from 'react-i18next';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import TripleSwitchSettingsGroup from '@/core/ui/forms/SettingsGroups/TripleSwitchSettingsGroup';
import { NotificationValidationType, type ChannelType } from '@/core/ui/forms/SettingsGroups/types/NotificationTypes';
import { BlockTitle, Caption } from '@/core/ui/typography/components';
import type { OrganizationNotificationSettings } from '@/domain/community/userAdmin/tabs/model/NotificationSettings.model';

interface OrganizationNotificationsSettingsProps {
  currentOrgSettings: OrganizationNotificationSettings | undefined;
  onUpdateSettings: (property: string, type: ChannelType, value: boolean) => void;
  isPushEnabled: boolean;
  isPushAvailable: boolean;
}

export const OrganizationNotificationsSettings = ({
  currentOrgSettings,
  onUpdateSettings,
  isPushEnabled,
  isPushAvailable,
}: OrganizationNotificationsSettingsProps) => {
  const { t } = useTranslation();

  return (
    <PageContentBlock>
      <BlockTitle>{t('pages.userNotificationsSettings.organization.title')}</BlockTitle>
      <Caption>{t('pages.userNotificationsSettings.organization.subtitle')}</Caption>
      <TripleSwitchSettingsGroup
        options={{
          adminMentioned: {
            inAppChecked: currentOrgSettings?.adminMentioned?.inApp || false,
            emailChecked: currentOrgSettings?.adminMentioned?.email || false,
            pushChecked: currentOrgSettings?.adminMentioned?.push || false,
            label: t('pages.userNotificationsSettings.organization.settings.mentioned'),
            validationRules: [
              {
                type: NotificationValidationType.REQUIRE_AT_LEAST_ONE,
                message: t('pages.userNotificationsSettings.tooltips.adminMentioned'),
              },
            ],
          },
          adminMessageReceived: {
            inAppChecked: currentOrgSettings?.adminMessageReceived?.inApp || false,
            emailChecked: currentOrgSettings?.adminMessageReceived?.email || false,
            pushChecked: currentOrgSettings?.adminMessageReceived?.push || false,
            label: t('pages.userNotificationsSettings.organization.settings.messageReceived'),
            validationRules: [
              {
                type: NotificationValidationType.LOCKED,
                message: t('pages.userNotificationsSettings.tooltips.adminMessageReceived'),
              },
            ],
          },
        }}
        onChange={onUpdateSettings}
        isPushEnabled={isPushEnabled}
        isPushAvailable={isPushAvailable}
      />
    </PageContentBlock>
  );
};
