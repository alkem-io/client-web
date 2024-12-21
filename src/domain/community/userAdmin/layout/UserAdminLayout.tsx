import React, { FC } from 'react';
import { useConfig } from '@/domain/platform/config/useConfig';
import { useUserContext } from '@/domain/community/user';
import UserPageBanner from '@/domain/community/user/layout/UserPageBanner';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import EntitySettingsLayout from '@/domain/platform/admin/layout/EntitySettingsLayout/EntitySettingsLayout';
import BreadcrumbsItem from '@/core/ui/navigation/BreadcrumbsItem';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import { AssignmentIndOutlined, Settings } from '@mui/icons-material';
import { buildUserProfileUrl } from '@/main/routing/urlBuilders';
import TopLevelPageBreadcrumbs from '@/main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import { useTranslation } from 'react-i18next';
import { PlatformFeatureFlagName } from '@/core/apollo/generated/graphql-schema';
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

interface UserAdminLayoutProps {
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

  const entityAttrs = {
    displayName: user?.user.profile.displayName || '',
    userNameId: user?.user.nameID || '',
  };

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
            uri={user && buildUserProfileUrl(user.user.nameID)}
          >
            {user?.user.profile.displayName}
          </BreadcrumbsItem>
          <BreadcrumbsItem iconComponent={Settings}>{t('common.settings')}</BreadcrumbsItem>
        </TopLevelPageBreadcrumbs>
      }
      entityTypeName="user"
      subheaderTabs={tabs}
      pageBannerComponent={UserPageBanner}
      {...entityAttrs}
      {...props}
    />
  );
};

export default UserAdminLayout;
