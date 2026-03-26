import { useTranslation } from 'react-i18next';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import TripleSwitchSettingsGroup from '@/core/ui/forms/SettingsGroups/TripleSwitchSettingsGroup';
import type { ChannelType } from '@/core/ui/forms/SettingsGroups/types/NotificationTypes';
import { BlockTitle, Caption } from '@/core/ui/typography/components';

interface VCNotificationSettings {
  adminSpaceCommunityInvitation?: {
    email: boolean;
    inApp: boolean;
    push: boolean;
  };
}

interface VCNotificationsSettingsProps {
  currentVCSettings: VCNotificationSettings | undefined;
  onUpdateSettings: (property: string, type: ChannelType, value: boolean) => void;
  isPushEnabled: boolean;
  isPushAvailable: boolean;
}

export const VCNotificationsSettings = ({
  currentVCSettings,
  onUpdateSettings,
  isPushEnabled,
  isPushAvailable,
}: VCNotificationsSettingsProps) => {
  const { t } = useTranslation();

  const vcOptions = {
    adminSpaceCommunityInvitation: {
      inAppChecked: currentVCSettings?.adminSpaceCommunityInvitation?.inApp || false,
      emailChecked: currentVCSettings?.adminSpaceCommunityInvitation?.email || false,
      pushChecked: currentVCSettings?.adminSpaceCommunityInvitation?.push || false,
      label: t('pages.userNotificationsSettings.virtualContributor.settings.spaceCommunityInvitation'),
    },
  };

  return (
    <PageContentBlock>
      <BlockTitle>{t('pages.userNotificationsSettings.virtualContributor.title')}</BlockTitle>
      <Caption>{t('pages.userNotificationsSettings.virtualContributor.subtitle')}</Caption>
      <TripleSwitchSettingsGroup
        options={vcOptions}
        onChange={onUpdateSettings}
        isPushEnabled={isPushEnabled}
        isPushAvailable={isPushAvailable}
      />
    </PageContentBlock>
  );
};
