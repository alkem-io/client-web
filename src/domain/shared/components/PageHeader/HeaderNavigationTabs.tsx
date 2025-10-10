import { SettingsOutlined } from '@mui/icons-material';
import { Box, styled, Tabs, TabsProps } from '@mui/material';
import { PropsWithChildren } from 'react';
import HeaderNavigationTab from './HeaderNavigationTab';
import { MAX_CONTENT_WIDTH_WITH_GUTTER_PX } from '@/core/ui/grid/constants';
import { gutters } from '@/core/ui/grid/utils';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { t } from 'i18next';

const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  '.MuiTabs-flexContainer': {
    maxWidth: MAX_CONTENT_WIDTH_WITH_GUTTER_PX,
    margin: 'auto',
    paddingLeft: gutters()(theme),
    paddingRight: gutters()(theme),
    gap: gutters()(theme),
    justifyContent: 'space-between',
  },
  '.MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.contrastText,
    bottom: 2,
    height: 2,
  },
  '.MuiTab-root': {
    flexGrow: 1,
    minHeight: theme.spacing(5),
    top: -2,
    color: theme.palette.primary.contrastText,
    '&.Mui-focusVisible': {
      color: theme.palette.highlight.contrastText,
    },
    '&.Mui-selected': {
      color: theme.palette.primary.contrastText,
      '&.Mui-focusVisible': {
        color: theme.palette.highlight.contrastText,
      },
    },
    '&:hover': {
      color: theme.palette.highlight.contrastText,
      backgroundColor: theme.palette.highlight.main,
    },
  },
  '.MuiTab-root.button-tab': {
    flexGrow: 0,
    flexShrink: 0,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  '.MuiTab-root.singleCenteredTab': {
    maxWidth: '40%',
    marginLeft: '30%',
    marginRight: '30%',
  },
  '.MuiTabs-scrollButtons': {
    display: 'none',
  },
}));

export interface NavigationTabsProps extends TabsProps {
  showSettings?: boolean;
  settingsUrl?: string;
  defaultTab: TabsProps['value'];
}

const HeaderNavigationTabs = ({
  value,
  defaultTab,
  'aria-label': ariaLabel,
  showSettings = false,
  settingsUrl = '',
  children,
}: PropsWithChildren<NavigationTabsProps>) => {
  // If cannot show Settings tab show the default tab.
  if (!showSettings && value === 'settings') {
    value = defaultTab;
  }
  return (
    <Box position="relative">
      <StyledTabs
        value={value}
        aria-label={ariaLabel}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        {children}
        {showSettings && (
          <HeaderNavigationTab
            className="button-tab"
            icon={<SettingsOutlined />}
            value={EntityPageSection.Settings}
            to={settingsUrl}
            aria-label={t('common.space-settings')}
          />
        )}
      </StyledTabs>
    </Box>
  );
};

export default HeaderNavigationTabs;
