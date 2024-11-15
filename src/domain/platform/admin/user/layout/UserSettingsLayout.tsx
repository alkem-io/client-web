import React, { FC } from 'react';
import { useConfig } from '../../../config/useConfig';
import { useUserContext } from '../../../../community/user';
import UserPageBanner from '../../../../community/user/layout/UserPageBanner';
import { UserProfileTabs, SettingsSection } from '../../layout/EntitySettingsLayout/constants';
import EntitySettingsLayout from '../../layout/EntitySettingsLayout/EntitySettingsLayout';
import BreadcrumbsItem from '@/core/ui/navigation/BreadcrumbsItem';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import { AssignmentIndOutlined, Settings } from '@mui/icons-material';
import { buildUserProfileUrl } from '@/main/routing/urlBuilders';
import TopLevelPageBreadcrumbs from '@/main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import { useTranslation } from 'react-i18next';
import { PlatformFeatureFlagName } from '@/core/apollo/generated/graphql-schema';

const tabs = [
  SettingsSection.MyProfile,
  SettingsSection.Account,
  SettingsSection.Membership,
  SettingsSection.Organizations,
  SettingsSection.Notifications,
].map(section => {
  return UserProfileTabs.find(tab => tab.section === section)!;
});

interface UserSettingsLayoutProps {
  currentTab: SettingsSection;
  tabRoutePrefix?: string;
}

const UserSettingsLayout: FC<UserSettingsLayoutProps> = props => {
  const { user, loading } = useUserContext();

  // Add credentials tab is SSI is enabled:
  const { isFeatureEnabled } = useConfig();
  if (isFeatureEnabled(PlatformFeatureFlagName.Ssi)) {
    tabs.push(UserProfileTabs.find(tab => tab.section === SettingsSection.Credentials)!);
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

export default UserSettingsLayout;
