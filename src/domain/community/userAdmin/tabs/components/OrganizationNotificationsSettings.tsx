import { useTranslation } from 'react-i18next';
import { BlockTitle, Caption } from '@/core/ui/typography/components';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import SwitchSettingsGroup from '@/core/ui/forms/SettingsGroups/SwitchSettingsGroup';
import { OrganizationNotificationSettings } from '@/domain/community/userAdmin/tabs/model/NotificationSettings.model';

interface OrganizationNotificationsSettingsProps {
  currentOrgSettings: OrganizationNotificationSettings | undefined;
  onUpdateSettings: (property: string, value: boolean) => void;
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
      <SwitchSettingsGroup
        options={{
          adminMentioned: {
            checked: currentOrgSettings?.adminMentioned?.email || false,
            label: t('pages.userNotificationsSettings.organization.settings.mentioned'),
          },
          adminMessageReceived: {
            checked: currentOrgSettings?.adminMessageReceived?.email || false,
            label: t('pages.userNotificationsSettings.organization.settings.messageReceived'),
          },
        }}
        onChange={onUpdateSettings}
      />
    </PageContentBlock>
  );
};
