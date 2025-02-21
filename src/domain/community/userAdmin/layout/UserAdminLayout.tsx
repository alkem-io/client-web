import { PlatformFeatureFlagName } from '@/core/apollo/generated/graphql-schema';
import BreadcrumbsItem from '@/core/ui/navigation/BreadcrumbsItem';
import { useUserContext } from '@/domain/community/user';
import UserPageBanner from '@/domain/community/user/layout/UserPageBanner';
import EntitySettingsLayout from '@/domain/platform/admin/layout/EntitySettingsLayout/EntitySettingsLayout';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { useConfig } from '@/domain/platform/config/useConfig';
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
  const { user, loading } = useUserContext();

  // Add credentials tab is SSI is enabled:
  const { isFeatureEnabled } = useConfig();
  if (isFeatureEnabled(PlatformFeatureFlagName.Ssi)) {
    tabs.push(UserAdminTabs.find(tab => tab.section === SettingsSection.Credentials)!);
  }

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
            avatar={user?.user.profile.avatar}
            iconComponent={AssignmentIndOutlined}
            uri={user?.user.profile.url}
          >
            {user?.user.profile.displayName}
          </BreadcrumbsItem>
          <BreadcrumbsItem iconComponent={Settings}>{t('common.settings')}</BreadcrumbsItem>
        </TopLevelPageBreadcrumbs>
      }
      entityTypeName="user"
      subheaderTabs={tabs}
      pageBannerComponent={UserPageBanner}
      {...props}
    />
  );
};

export default UserAdminLayout;
