import React, { FC, ReactNode, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import HeaderNavigationTabs from '../../shared/components/PageHeader/HeaderNavigationTabs';
import HeaderNavigationTab from '../../shared/components/PageHeader/HeaderNavigationTab';
import { EntityPageSection } from '../../shared/layout/EntityPageSection';
import { EntityTypeName } from '../../platform/constants/EntityTypeName';
import HeaderNavigationButton from '../../shared/components/PageHeader/HeaderNavigationButton';
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
import hexToRGBA from '../../../core/utils/hexToRGBA';
import {
  DashboardOutlined,
  MoreVertOutlined,
  SchoolOutlined,
  SettingsOutlined,
  ShareOutlined,
} from '@mui/icons-material';
import { CalloutIcon } from '../../collaboration/callout/icon/CalloutIcon';
import useNavigate from '../../../core/routing/useNavigate';
import getEntityColor from '../../shared/utils/getEntityColor';
import useShare from '../../../core/utils/Share';
import { EntityTabsProps } from '../common/EntityPageLayout';
import { gutters } from '../../../core/ui/grid/utils';

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

export interface EntityPageTabsProps extends EntityTabsProps {
  showSettings: boolean;
  settingsUrl: string;
  entityTypeName: EntityTypeName;
  subEntityTab?: SubEntityTabDefinition;
  // TODO remove rootUrl after refactoring EntitySettingsLayout
  rootUrl: string;
  shareUrl: string;
  actions?: ActionDefinition[];
}

enum NavigationActions {
  Share = 'share',
  More = 'more',
}

const SpacePageTabs: FC<EntityPageTabsProps> = ({
  currentTab,
  showSettings,
  settingsUrl,
  entityTypeName,
  subEntityTab,
  rootUrl,
  shareUrl,
  mobile,
  actions,
  onMenuOpen,
}) => {
  const { t } = useTranslation();

  const { share, shareDialog } = useShare({ url: shareUrl, entityTypeName });

  const navigate = useNavigate();

  const theme = useTheme();

  const navigationBackgroundColor = getEntityColor(theme, entityTypeName);
  const navigationForegroundColor =
    /*
    entityTypeName === 'opportunity' ? theme.palette.space.main : */ theme.palette.common.white;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
              value={EntityPageSection.Community}
              label={t('common.community')}
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
            <BottomNavigationAction
              value={EntityPageSection.KnowledgeBase}
              label={t('pages.space.sections.knowledge-base.header')}
              icon={<SchoolOutlined />}
            />
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
          label={t('common.community')}
          value={EntityPageSection.Community}
          to={`${rootUrl}/${EntityPageSection.Community}`}
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
          label={t('common.knowledge-base')}
          value={EntityPageSection.KnowledgeBase}
          to={`${rootUrl}/${EntityPageSection.KnowledgeBase}`}
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

export default SpacePageTabs;
