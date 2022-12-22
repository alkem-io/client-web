import React from 'react';
import { useTheme } from '@mui/styles';
import { EntityTabsProps } from '../../challenge/common/EntityPageLayout';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import getEntityColor from '../utils/getEntityColor';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { SettingsOutlined, SvgIconComponent } from '@mui/icons-material';
import { EntityPageSection } from './EntityPageSection';
import HeaderNavigationTab from '../components/PageHeader/HeaderNavigationTab';
import hexToRGBA from '../../../common/utils/hexToRGBA';
import HeaderNavigationTabs from '../components/PageHeader/HeaderNavigationTabs';
import { FloatingActionButtons } from '../../../common/components/core';

interface ProfileTabsProps extends EntityTabsProps {
  showSettings: boolean;
  profileIconComponent: SvgIconComponent;
  routes: Record<EntityPageSection.Profile | EntityPageSection.Settings, string>;
}

const ProfileTabs = ({
  currentTab,
  showSettings,
  routes,
  mobile,
  profileIconComponent: ProfileIcon,
}: ProfileTabsProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();

  const navigationBackgroundColor = getEntityColor(theme, 'profile');
  const navigationForegroundColor = theme.palette.common.white;

  if (mobile) {
    return (
      <>
        {/*TODO z-index fixes content of Organization settings laying over the navigation tabs*/}
        {/*TODO investigate why it happens and fix properly*/}
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1 }} elevation={3} square>
          <BottomNavigation
            showLabels
            value={currentTab}
            onChange={(event, nextValue) => {
              navigate(routes[nextValue]);
            }}
            sx={{
              backgroundColor: navigationBackgroundColor,
              '.MuiBottomNavigationAction-root.Mui-selected': {
                color: navigationForegroundColor,
              },
              '.MuiBottomNavigationAction-root:not(.Mui-selected)': {
                color: hexToRGBA(navigationForegroundColor, 0.75),
              },
            }}
          >
            <BottomNavigationAction
              value={EntityPageSection.Profile}
              label={t('common.profile')}
              icon={<ProfileIcon />}
            />
            {showSettings && (
              <BottomNavigationAction
                value={EntityPageSection.Settings}
                label={t('common.settings')}
                icon={<SettingsOutlined />}
              />
            )}
          </BottomNavigation>
        </Paper>
        <FloatingActionButtons bottom={theme => theme.spacing(10)} />
      </>
    );
  }

  return (
    <HeaderNavigationTabs
      value={currentTab}
      defaultTab={EntityPageSection.Profile}
      showSettings={showSettings}
      settingsUrl={routes[EntityPageSection.Settings]}
    >
      <HeaderNavigationTab
        label={t('common.profile')}
        value={EntityPageSection.Profile}
        to={routes[EntityPageSection.Profile]}
        className="singleCenteredTab"
      />
    </HeaderNavigationTabs>
  );
};

export default ProfileTabs;
