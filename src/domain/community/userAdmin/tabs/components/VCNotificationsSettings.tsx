import { useTranslation } from 'react-i18next';
import { BlockTitle, Caption } from '@/core/ui/typography/components';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import DualSwitchSettingsGroup from '@/core/ui/forms/SettingsGroups/DualSwitchSettingsGroup';

interface VCNotificationSettings {
  adminSpaceCommunityInvitation?: {
    email: boolean;
    inApp: boolean;
  };
}

interface VCNotificationsSettingsProps {
  currentVCSettings: VCNotificationSettings | undefined;
  onUpdateSettings: (property: string, type: 'inApp' | 'email', value: boolean) => void;
}

export const VCNotificationsSettings = ({ currentVCSettings, onUpdateSettings }: VCNotificationsSettingsProps) => {
  const { t } = useTranslation();

  const vcOptions = {
    adminSpaceCommunityInvitation: {
      inAppChecked: currentVCSettings?.adminSpaceCommunityInvitation?.inApp || false,
      emailChecked: currentVCSettings?.adminSpaceCommunityInvitation?.email || false,
      label: t('pages.userNotificationsSettings.virtualContributor.settings.spaceCommunityInvitation'),
    },
  };

  return (
    <PageContentBlock>
      <BlockTitle>{t('pages.userNotificationsSettings.virtualContributor.title')}</BlockTitle>
      <Caption>{t('pages.userNotificationsSettings.virtualContributor.subtitle')}</Caption>
      <DualSwitchSettingsGroup options={vcOptions} onChange={onUpdateSettings} />
    </PageContentBlock>
  );
};
