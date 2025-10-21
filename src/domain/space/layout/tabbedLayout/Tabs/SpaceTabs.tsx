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
import { History, MoreVertOutlined, SettingsOutlined, ShareOutlined, VideocamOutlined } from '@mui/icons-material';
import useNavigate from '@/core/routing/useNavigate';
import getEntityColor from '@/domain/shared/utils/getEntityColor';
import useShare from '@/core/utils/Share';
import { gutters } from '@/core/ui/grid/utils';
import ActivityDialog from '../../../components/Activity/ActivityDialog';
import VideoCallDialog from '@/domain/space/components/VideoCallDialog/VideoCallDialog';
import { useSpace } from '../../../context/useSpace';
import { useVideoCall } from '../../../hooks/useVideoCall';
import { buildSettingsUrl, buildSpaceSectionUrl } from '@/main/routing/urlBuilders';
import useSpaceTabs from '../layout/useSpaceTabs';
import { useLocation } from 'react-router-dom';

type TabDefinition = {
  label: ReactNode;
  icon: TabProps['icon'];
  section: EntityPageSection;
};

export interface ActionDefinition extends TabDefinition {
  onClick: () => void;
}

interface SpacePageTabsProps {
  actions?: ActionDefinition[];
  currentTab?: { sectionIndex: number } | { section: EntityPageSection } | undefined;
  mobile?: boolean;
  onMenuOpen?: (open: boolean) => void;
  loading?: boolean;
}

enum NavigationActions {
  Share = 'share',
  Activity = 'activity',
  VideoCall = 'videoCall',
  More = 'more',
}

const SpaceTabs = ({ currentTab, mobile, actions, onMenuOpen }: SpacePageTabsProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();

  const { pathname } = useLocation();

  const { space, permissions, loading } = useSpace();
  const { id: spaceId, about } = space;
  const { isVideoCallEnabled, storageAggregatorId } = useVideoCall(spaceId);
  const { tabs, showSettings } = useSpaceTabs({
    skip: !permissions.canRead || loading,
    spaceId: permissions.canRead ? spaceId : undefined,
  });

  const spaceUrl = about.profile.url;
  const { share, shareDialog } = useShare({ url: spaceUrl, entityTypeName: 'space' });
  const settingsUrl = buildSettingsUrl(about.profile.url);

  const navigationBackgroundColor = getEntityColor(theme, 'space');
  const navigationForegroundColor = theme.palette.common.white;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isActivityVisible, setIsActivityVisible] = useState(false);
  const [isVideoCallDialogVisible, setIsVideoCallDialogVisible] = useState(false);

  useLayoutEffect(() => {
    onMenuOpen?.(isDrawerOpen);
  }, [isDrawerOpen]);

  let selectedTab: EntityPageSection | number = -1;

  if (currentTab) {
    if ('sectionIndex' in currentTab) {
      selectedTab = currentTab.sectionIndex;
    }
    if ('section' in currentTab) {
      selectedTab = currentTab.section;
    }
  }
  if (pathname.split('/').includes('settings')) {
    selectedTab = EntityPageSection.Settings;
  }

  const navigationContent = mobile ? (
    <BottomNavigation
      showLabels
      value={selectedTab}
      onChange={(event, nextValue) => {
        switch (nextValue) {
          case NavigationActions.Share: {
            share();
            return;
          }
          case NavigationActions.VideoCall: {
            if (isVideoCallEnabled) {
              setIsVideoCallDialogVisible(true);
            }
            return;
          }
          case NavigationActions.More:
          case EntityPageSection.Settings:
          case EntityPageSection.Search:
            return;
        }
        navigate(buildSpaceSectionUrl(spaceUrl, nextValue + 1));
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
      {tabs.map((tab, index) => (
        <BottomNavigationAction key={index} value={index} label={tab.label} icon={tab.icon} />
      ))}
      {!showSettings && spaceUrl && (
        <BottomNavigationAction value={NavigationActions.Share} label={t('buttons.share')} icon={<ShareOutlined />} />
      )}
      {showSettings && selectedTab !== EntityPageSection.Settings && (
        <BottomNavigationAction
          value={NavigationActions.More}
          label={t('common.more')}
          icon={<MoreVertOutlined />}
          onClick={() => setIsDrawerOpen(true)}
        />
      )}
      {showSettings && selectedTab === EntityPageSection.Settings && (
        <BottomNavigationAction
          value={EntityPageSection.Settings}
          label={t('common.settings')}
          icon={<SettingsOutlined />}
        />
      )}
    </BottomNavigation>
  ) : (
    <HeaderNavigationTabs
      value={selectedTab}
      defaultTab={0}
      aria-label={t('pages.admin.space.aria.tabs')}
      showSettings={showSettings}
      settingsUrl={settingsUrl}
    >
      {tabs.map((tab, index) => (
        <HeaderNavigationTab
          key={index}
          value={index}
          label={tab.label}
          to={buildSpaceSectionUrl(spaceUrl, index + 1)}
        />
      ))}
      {actions?.map((action, index) => (
        <HeaderNavigationButton key={index} icon={action.icon} onClick={action.onClick} value={action.section} />
      ))}
      <HeaderNavigationButton
        icon={<History />}
        value={NavigationActions.Activity}
        onClick={() => setIsActivityVisible(true)}
      />
      {isVideoCallEnabled && (
        <HeaderNavigationButton
          icon={<VideocamOutlined />}
          value={NavigationActions.VideoCall}
          onClick={() => setIsVideoCallDialogVisible(true)}
        />
      )}
      {spaceUrl && <HeaderNavigationButton icon={<ShareOutlined />} value={NavigationActions.Share} onClick={share} />}
    </HeaderNavigationTabs>
  );

  return (
    <>
      {mobile && (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, paddingBottom: gutters() }} elevation={3} square>
          {navigationContent}
        </Paper>
      )}
      {!mobile && navigationContent}

      {shareDialog}

      <ActivityDialog open={isActivityVisible} onClose={() => setIsActivityVisible(false)} />

      {isVideoCallEnabled && (
        <VideoCallDialog
          open={isVideoCallDialogVisible}
          onClose={() => setIsVideoCallDialogVisible(false)}
          storageAggregatorId={storageAggregatorId ?? ''}
          spaceNameId={space.nameID}
        />
      )}

      {mobile && showSettings && (
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
            {isVideoCallEnabled && (
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    setIsDrawerOpen(false);
                    setIsVideoCallDialogVisible(true);
                  }}
                >
                  <ListItemIcon>
                    <VideocamOutlined />
                  </ListItemIcon>
                  <ListItemText primary={t('spaceDialog.videoCall')} />
                </ListItemButton>
              </ListItem>
            )}
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
};

export default SpaceTabs;
