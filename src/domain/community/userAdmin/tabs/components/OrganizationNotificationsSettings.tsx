import { useTranslation } from 'react-i18next';
import { BlockTitle, Caption } from '@/core/ui/typography/components';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import DualSwitchSettingsGroup from '@/core/ui/forms/SettingsGroups/DualSwitchSettingsGroup';
import { OrganizationNotificationSettings } from '@/domain/community/userAdmin/tabs/model/NotificationSettings.model';
import { NotificationValidationType } from '@/core/ui/forms/SettingsGroups/types/NotificationTypes';

interface OrganizationNotificationsSettingsProps {
  currentOrgSettings: OrganizationNotificationSettings | undefined;
  onUpdateSettings: (property: string, type: 'inApp' | 'email', value: boolean) => void;
}

export const OrganizationNotificationsSettings = ({
  currentOrgSettings,
  onUpdateSettings,
}: OrganizationNotificationsSettingsProps) => {
  const { t } = useTranslation();

  return (
    <PageContentBlock>
      <BlockTitle>{t('pages.userNotificationsSettings.organization.title')}</BlockTitle>
      <Caption>{t('pages.userNotificationsSettings.organization.subtitle')}</Caption>
      <DualSwitchSettingsGroup
        options={{
          adminMentioned: {
            inAppChecked: currentOrgSettings?.adminMentioned?.inApp || false,
            emailChecked: currentOrgSettings?.adminMentioned?.email || false,
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
      />
    </PageContentBlock>
  );
};
