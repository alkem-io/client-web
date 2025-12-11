import BreadcrumbsItem from '@/core/ui/navigation/BreadcrumbsItem';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import EntitySettingsLayout from '@/domain/platformAdmin/layout/EntitySettingsLayout/EntitySettingsLayout';
import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import TopLevelPageBreadcrumbs from '@/main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import { AssignmentIndOutlined, Settings } from '@mui/icons-material';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import { FC, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { UserAdminTabs } from '../UserAdminTabs';

const tabs = [
  SettingsSection.MyProfile,
  SettingsSection.Account,
  SettingsSection.Membership,
  SettingsSection.Organizations,
  SettingsSection.Notifications,
  SettingsSection.Settings,
].map(section => {
  return UserAdminTabs.find(tab => tab.section === section)!;
});

interface UserAdminLayoutProps extends PropsWithChildren {
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
}

const UserAdminLayout: FC<UserAdminLayoutProps> = props => {
  const { userModel, loading } = useCurrentUserContext();

  // if (isFeatureEnabled(PlatformFeatureFlagName.Ssi)) {
  //   tabs.push(UserAdminTabs.find(tab => tab.section === SettingsSection.Credentials)!);
  // }

  const { t } = useTranslation();

  return (
    <EntitySettingsLayout
      breadcrumbs={
        <TopLevelPageBreadcrumbs>
          <BreadcrumbsItem uri="/contributors" iconComponent={GroupOutlinedIcon}>
            {t('pages.contributors.shortName')}
          </BreadcrumbsItem>
          <BreadcrumbsItem
            loading={loading}
            avatar={userModel?.profile.avatar}
            iconComponent={AssignmentIndOutlined}
            uri={userModel?.profile.url}
          >
            {userModel?.profile.displayName}
          </BreadcrumbsItem>
          <BreadcrumbsItem iconComponent={Settings}>{t('common.settings')}</BreadcrumbsItem>
        </TopLevelPageBreadcrumbs>
      }
      entityTypeName="user"
      subheaderTabs={tabs}
      {...props}
    />
  );
};

export default UserAdminLayout;
