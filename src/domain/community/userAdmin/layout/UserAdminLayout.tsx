import EntitySettingsLayout from '@/domain/platformAdmin/layout/EntitySettingsLayout/EntitySettingsLayout';
import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import { FC, PropsWithChildren } from 'react';
import { UserAdminTabs } from '../UserAdminTabs';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { useTranslation } from 'react-i18next';

const tabs = [
  SettingsSection.MyProfile,
  SettingsSection.Account,
  SettingsSection.Membership,
  SettingsSection.Organizations,
  SettingsSection.Notifications,
  SettingsSection.Settings,
  SettingsSection.Security,
].map(section => {
  return UserAdminTabs.find(tab => tab.section === section)!;
});

interface UserAdminLayoutProps extends PropsWithChildren {
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
}

const UserAdminLayout: FC<UserAdminLayoutProps> = props => {
  const { t } = useTranslation();

  // Set browser tab title to "Administration | Alkemio"
  usePageTitle(t('pages.titles.admin'));

  // if (isFeatureEnabled(PlatformFeatureFlagName.Ssi)) {
  //   tabs.push(UserAdminTabs.find(tab => tab.section === SettingsSection.Credentials)!);
  // }

  return <EntitySettingsLayout entityTypeName="user" subheaderTabs={tabs} {...props} />;
};

export default UserAdminLayout;
