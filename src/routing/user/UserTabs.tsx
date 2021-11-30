import { ContentPasteOutlined, ForumOutlined, GroupOutlined, SettingsOutlined } from '@mui/icons-material';
import { Tabs } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import NavigationTab from '../../components/core/NavigationTab/NavigationTab';
import NavigationTabs from '../../components/core/NavigationTab/NavigationTabs';
import { RouterLink } from '../../components/core/RouterLink';

const routes = {
  profile: '/profile',
  membership: '/membership',
  organizations: '/organizations',
  notifications: '/notifications',
  root: '/',
};

export interface UserTabsProps {}

const UserTabs: FC<UserTabsProps> = ({ children }) => {
  const { t } = useTranslation();

  return (
    <>
      <NavigationTabs routes={routes}>
        {(routesObj, value) => (
          <Tabs value={value}>
            <NavigationTab
              icon={<GroupOutlined />}
              label={t('common.my-profile')}
              component={RouterLink}
              {...routesObj['profile']}
            />
            <NavigationTab
              icon={<ContentPasteOutlined />}
              label={t('common.membership')}
              component={RouterLink}
              {...routesObj['membership']}
            />

            <NavigationTab
              icon={<ForumOutlined />}
              label={t('common.organizations')}
              component={RouterLink}
              {...routesObj['organizations']}
            />
            <NavigationTab
              icon={<SettingsOutlined />}
              label={t('common.notifications')}
              component={RouterLink}
              {...routesObj['notifications']}
            />
          </Tabs>
        )}
      </NavigationTabs>
      {children}
    </>
  );
};

export default UserTabs;
