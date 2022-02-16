import { ContentPasteOutlined, ForumOutlined, GroupOutlined, SettingsOutlined } from '@mui/icons-material';
import { Tabs } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import NavigationTab from '../../components/core/NavigationTab/NavigationTab';
import NavigationTabs from '../../components/core/NavigationTab/NavigationTabs';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

const routes = {
  profile: 'profile',
  membership: 'membership',
  organizations: 'organizations',
  notifications: 'notifications',
  credentials: 'credentials',
};

export interface UserTabsProps {}

const UserTabs: FC<UserTabsProps> = ({ children }) => {
  const { t } = useTranslation();

  return (
    <>
      <NavigationTabs routes={routes}>
        {(routesObj, value) => (
          <Tabs value={value} sx={{ marginBottom: 4 }}>
            <NavigationTab icon={<GroupOutlined />} label={t('common.my-profile')} {...routesObj['profile']} />
            <NavigationTab
              icon={<ContentPasteOutlined />}
              label={t('common.membership')}
              {...routesObj['membership']}
            />

            <NavigationTab icon={<ForumOutlined />} label={t('common.organizations')} {...routesObj['organizations']} />
            <NavigationTab
              icon={<SettingsOutlined />}
              label={t('common.notifications')}
              {...routesObj['notifications']}
            />
            <NavigationTab icon={<VerifiedUserIcon />} label={t('common.credentials')} {...routesObj['credentials']} />
          </Tabs>
        )}
      </NavigationTabs>
      {children}
    </>
  );
};

export default UserTabs;
