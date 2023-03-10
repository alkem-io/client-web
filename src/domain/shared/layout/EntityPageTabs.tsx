import React, { FC, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import HeaderNavigationTabs from '../components/PageHeader/HeaderNavigationTabs';
import HeaderNavigationTab from '../components/PageHeader/HeaderNavigationTab';
import { EntityPageSection } from './EntityPageSection';
import { EntityTypeName } from '../../platform/constants/EntityTypeName';
import HeaderNavigationButton from '../components/PageHeader/HeaderNavigationButton';
import { ShareDialog } from '../components/ShareDialog/ShareDialog';
import {
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
import hexToRGBA from '../../../common/utils/hexToRGBA';
import {
  DashboardOutlined,
  InfoOutlined,
  MoreVertOutlined,
  SettingsOutlined,
  ShareOutlined,
} from '@mui/icons-material';
import { CalloutIcon } from '../../collaboration/callout/icon/CalloutIcon';
import { useNavigate } from 'react-router-dom';
import getEntityColor from '../utils/getEntityColor';
import { FloatingActionButtons } from '../../../common/components/core';
import HelpButton from '../../../common/components/core/FloatingActionButtons/HelpButton/HelpButton';

interface TabDefinition {
  label: ReactNode;
  icon: TabProps['icon'];
  section?: EntityPageSection;
}

export interface ActionDefinition extends TabDefinition {
  onClick: () => void;
}

export interface SubEntityTabDefinition extends TabDefinition {
  section: EntityPageSection;
  disabled?: boolean;
}

export interface EntityPageTabsProps {
  currentTab: EntityPageSection;
  showSettings: boolean;
  settingsUrl: string;
  entityTypeName: EntityTypeName;
  subEntityTab?: SubEntityTabDefinition;
  // TODO remove rootUrl after refactoring EntitySettingsLayout
  rootUrl: string;
  shareUrl: string;
  mobile?: boolean;
  actions?: ActionDefinition[];
}

enum NavigationActions {
  Share = 'share',
  More = 'more',
}

// https://developer.mozilla.org/en-US/docs/Web/API/Navigator/canShare
interface ShareCapableNavigator extends Navigator {
  canShare(data?: ShareData | undefined): boolean;
}

const EntityPageTabs: FC<EntityPageTabsProps> = ({
  currentTab,
  showSettings,
  settingsUrl,
  entityTypeName,
  subEntityTab,
  rootUrl,
  shareUrl,
  mobile,
  actions,
}) => {
  const { t } = useTranslation();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const share = async () => {
    const shareNavigator = navigator as ShareCapableNavigator;
    if (shareNavigator.canShare?.({ url: shareUrl })) {
      await shareNavigator.share({ url: shareUrl });
    } else {
      setShareDialogOpen(true);
    }
  };

  const navigate = useNavigate();

  const theme = useTheme();

  const navigationBackgroundColor = getEntityColor(theme, entityTypeName);
  const navigationForegroundColor =
    /*
    entityTypeName === 'opportunity' ? theme.palette.hub.main : */ theme.palette.common.white;

  const shareDialog = shareUrl && (
    <ShareDialog
      open={shareDialogOpen}
      onClose={() => setShareDialogOpen(false)}
      url={shareUrl}
      entityTypeName={entityTypeName}
    />
  );

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (mobile) {
    return (
      <>
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3} square>
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
              // TODO remove rootUrl after refactoring EntitySettingsLayout
              // navigate(nextValue);
              navigate(`${rootUrl}/${nextValue}`);
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
              value={EntityPageSection.Dashboard}
              label={t('common.dashboard')}
              icon={<DashboardOutlined />}
            />
            <BottomNavigationAction
              value={EntityPageSection.Contribute}
              label={t('common.contribute')}
              icon={<CalloutIcon />}
            />
            {subEntityTab && (
              <BottomNavigationAction
                value={subEntityTab.section}
                label={subEntityTab.label}
                icon={subEntityTab.icon}
                disabled={subEntityTab.disabled}
              />
            )}
            <BottomNavigationAction value={EntityPageSection.About} label={t('common.about')} icon={<InfoOutlined />} />
            {!showSettings && shareUrl && (
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
                    setShareDialogOpen(true);
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
        <FloatingActionButtons
          bottom={theme => theme.spacing(10)}
          visible={!isDrawerOpen}
          floatingActions={<HelpButton />}
        />
      </>
    );
  }

  return (
    <>
      <HeaderNavigationTabs
        value={currentTab}
        defaultTab={EntityPageSection.Dashboard}
        aria-label={`${entityTypeName} tabs`}
        showSettings={showSettings}
        settingsUrl={settingsUrl}
      >
        <HeaderNavigationTab
          label={t('common.dashboard')}
          value={EntityPageSection.Dashboard}
          to={`${rootUrl}/${EntityPageSection.Dashboard}`}
        />
        <HeaderNavigationTab
          label={t('common.explore')}
          value={EntityPageSection.Contribute}
          to={`${rootUrl}/${EntityPageSection.Contribute}`}
        />
        {subEntityTab && (
          <HeaderNavigationTab
            label={subEntityTab.label}
            value={subEntityTab.section}
            to={`${rootUrl}/${subEntityTab.section}`}
            disabled={subEntityTab.disabled}
          />
        )}
        <HeaderNavigationTab
          label={t('common.about')}
          value={EntityPageSection.About}
          to={`${rootUrl}/${EntityPageSection.About}`}
        />
        {actions?.map((action, index) => (
          <HeaderNavigationButton key={index} icon={action.icon} onClick={action.onClick} value={action.section} />
        ))}
        {shareUrl && (
          <HeaderNavigationButton icon={<ShareOutlined />} value={NavigationActions.Share} onClick={share} />
        )}
      </HeaderNavigationTabs>
      {shareDialog}
    </>
  );
};

export default EntityPageTabs;
