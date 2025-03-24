import { ReactNode, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import HeaderNavigationTabs from '@/domain/shared/components/PageHeader/HeaderNavigationTabs';
import HeaderNavigationTab from '@/domain/shared/components/PageHeader/HeaderNavigationTab';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import HeaderNavigationButton from '@/domain/shared/components/PageHeader/HeaderNavigationButton';
import {
  alpha,
  BottomNavigation,
  BottomNavigationAction,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  TabProps,
  useTheme,
} from '@mui/material';
import { History, MoreVertOutlined, SettingsOutlined, ShareOutlined } from '@mui/icons-material';
import useNavigate from '@/core/routing/useNavigate';
import getEntityColor from '@/domain/shared/utils/getEntityColor';
import useShare from '@/core/utils/Share';
import { EntityTabsProps } from '../../../../journey/common/EntityPageLayout';
import { gutters } from '@/core/ui/grid/utils';
import ActivityDialog from '../../../../journey/common/Activity/ActivityDialog';
import { useSpace } from '../../../context/useSpace';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';
import useSpaceTabs from '../../../../journey/space/layout/useSpaceTabs';

type TabDefinition = {
  label: ReactNode;
  icon: TabProps['icon'];
  section?: EntityPageSection;
};

export interface ActionDefinition extends TabDefinition {
  onClick: () => void;
}

interface SpacePageTabsProps extends EntityTabsProps {
  actions?: ActionDefinition[];
}

enum NavigationActions {
  Share = 'share',
  Activity = 'activity',
  More = 'more',
}

const SpaceTabs = ({ currentTab, mobile, actions, onMenuOpen }: SpacePageTabsProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();

  const { space, permissions } = useSpace();
  const { id: spaceId, about } = space;
  const { tabs, showSettings } = useSpaceTabs({ spaceId: permissions.canRead ? spaceId : undefined });

  const spaceUrl = about.profile.url;
  const { share, shareDialog } = useShare({ url: spaceUrl, entityTypeName: 'space' });
  const settingsUrl = buildSettingsUrl(about.profile.url);

  const navigationBackgroundColor = getEntityColor(theme, 'space');
  const navigationForegroundColor = theme.palette.common.white;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isActivityVisible, setIsActivityVisible] = useState(false);

  useLayoutEffect(() => {
    onMenuOpen?.(isDrawerOpen);
  }, [isDrawerOpen]);

  if (mobile) {
    return (
      <>
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, paddingBottom: gutters() }} elevation={3} square>
          <BottomNavigation
            showLabels
            value={currentTab}
            onChange={(event, nextValue) => {
              switch (nextValue) {
                case NavigationActions.Share: {
                  share();
                  return;
                }
                case NavigationActions.More:
                case EntityPageSection.Settings:
                case EntityPageSection.Search:
                  return;
              }
              navigate(`${spaceUrl}/${nextValue}`);
            }}
            sx={{
              backgroundColor: navigationBackgroundColor,
              '.MuiBottomNavigationAction-root.Mui-selected': {
                color: navigationForegroundColor,
              },
              '.MuiBottomNavigationAction-root:not(.Mui-selected)': {
                color: alpha(navigationForegroundColor, 0.75),
              },
            }}
          >
            {tabs.map(tab => (
              <BottomNavigationAction key={tab.value} value={tab.value} label={tab.label} icon={tab.icon} />
            ))}
            {!showSettings && spaceUrl && (
              <BottomNavigationAction
                value={NavigationActions.Share}
                label={t('buttons.share')}
                icon={<ShareOutlined />}
              />
            )}
            {showSettings && currentTab !== EntityPageSection.Settings && (
              <BottomNavigationAction
                value={NavigationActions.More}
                label={t('common.more')}
                icon={<MoreVertOutlined />}
                onClick={() => setIsDrawerOpen(true)}
              />
            )}
            {showSettings && currentTab === EntityPageSection.Settings && (
              <BottomNavigationAction
                value={EntityPageSection.Settings}
                label={t('common.settings')}
                icon={<SettingsOutlined />}
              />
            )}
          </BottomNavigation>
        </Paper>
        {shareDialog}
        <ActivityDialog open={isActivityVisible} onClose={() => setIsActivityVisible(false)} spaceId={spaceId} />
        {showSettings && (
          <Drawer anchor="bottom" open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
            <List>
              {actions?.map((action, index) => (
                <ListItem key={`action_${index}`} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      setIsDrawerOpen(false);
                      action.onClick();
                    }}
                  >
                    <ListItemIcon>{action.icon}</ListItemIcon>
                    <ListItemText primary={action.label} />
                  </ListItemButton>
                </ListItem>
              ))}
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    setIsDrawerOpen(false);
                    setIsActivityVisible(true);
                  }}
                >
                  <ListItemIcon>
                    <History />
                  </ListItemIcon>
                  <ListItemText primary={t('common.contributions')} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    setIsDrawerOpen(false);
                    share();
                  }}
                >
                  <ListItemIcon>
                    <ShareOutlined />
                  </ListItemIcon>
                  <ListItemText primary={t('buttons.share')} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => navigate(settingsUrl)}>
                  <ListItemIcon>
                    <SettingsOutlined />
                  </ListItemIcon>
                  <ListItemText primary={t('common.settings')} />
                </ListItemButton>
              </ListItem>
            </List>
          </Drawer>
        )}
      </>
    );
  }

  return (
    <>
      <HeaderNavigationTabs
        value={currentTab}
        defaultTab={EntityPageSection.Dashboard}
        aria-label={t('pages.admin.space.aria.tabs')}
        showSettings={showSettings}
        settingsUrl={settingsUrl}
      >
        {tabs.map(tab => (
          <HeaderNavigationTab key={tab.value} label={tab.label} value={tab.value} to={`${spaceUrl}/${tab.value}`} />
        ))}
        {actions?.map((action, index) => (
          <HeaderNavigationButton key={index} icon={action.icon} onClick={action.onClick} value={action.section} />
        ))}
        <HeaderNavigationButton
          icon={<History />}
          value={NavigationActions.Activity}
          onClick={() => setIsActivityVisible(true)}
        />
        {spaceUrl && (
          <HeaderNavigationButton icon={<ShareOutlined />} value={NavigationActions.Share} onClick={share} />
        )}
      </HeaderNavigationTabs>
      {shareDialog}
      <ActivityDialog open={isActivityVisible} onClose={() => setIsActivityVisible(false)} spaceId={spaceId} />
    </>
  );
};

export default SpaceTabs;

export const SpaceTabsPlaceholder = ({ mobile, loading }: SpacePageTabsProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigationBackgroundColor = getEntityColor(theme, 'space');
  const navigationForegroundColor = theme.palette.common.white;
  const value = loading ? 'loading' : undefined;
  if (mobile) {
    return (
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, paddingBottom: gutters() }} elevation={3} square>
        <BottomNavigation
          showLabels
          value={value}
          sx={{
            backgroundColor: navigationBackgroundColor,
            '.MuiBottomNavigationAction-root.Mui-selected': {
              color: navigationForegroundColor,
            },
            '.MuiBottomNavigationAction-root:not(.Mui-selected)': {
              color: alpha(navigationForegroundColor, 0.75),
            },
          }}
        >
          {loading && <BottomNavigationAction key="loading" value="loading" label="Loading..." />}
        </BottomNavigation>
      </Paper>
    );
  }

  return (
    <>
      <HeaderNavigationTabs value="loading" defaultTab="loading" aria-label={t('pages.admin.space.aria.tabs')}>
        {loading && (
          <HeaderNavigationTab
            key="loading"
            label={t('common.loading')}
            value={value}
            to=""
            disabled
            sx={{ marginX: 'auto' }}
          />
        )}
      </HeaderNavigationTabs>
    </>
  );
};
