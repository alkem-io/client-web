import { SettingsOutlined } from '@mui/icons-material';
import { Box, styled, Tabs, TabsProps } from '@mui/material';
import { FC } from 'react';
import HeaderNavigationTab from './HeaderNavigationTab';

const Root = styled(Box)(({ theme }) => ({
  position: 'relative',
  // ButtonTabs are small tabs-like buttons at the end of the Tabs component, like Share button
  '& .MuiTab-root.button-tab': {
    flex: 'none',
    minWidth: 24,
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
  },
  '& .MuiTabs-root': {
    paddingLeft: theme.spacing(2),
    paddingRight: 0,
    [theme.breakpoints.only('xs')]: {
      paddingLeft: 1,
      paddingRight: 1,
    },
  },
  '& .MuiTab-root.singleCenteredTab': {
    maxWidth: '40%',
    marginLeft: '30%',
    marginRight: '30%',
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  minHeight: 0,
  color: theme.palette.primary.contrastText,
  backgroundColor: theme.palette.primary.main,
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.contrastText,
    bottom: 2,
    height: 2,
  },
  '& .MuiTab-root': {
    fontSize: theme.typography.button.fontSize,
    flexGrow: 1,
    minHeight: theme.spacing(5),
    top: -2,
    marginRight: 0,
  },
}));

export interface NavigationTabsProps extends TabsProps {
  showSettings?: boolean;
  settingsUrl?: string;
  defaultTab: TabsProps['value'];
}

const HeaderNavigationTabs: FC<NavigationTabsProps> = ({
  value,
  defaultTab,
  'aria-label': ariaLabel,
  showSettings = false,
  settingsUrl = '',
  children,
}) => {
  // If cannot show Settings tab show the default tab.
  if (!showSettings && value === 'settings') {
    value = defaultTab;
  }

  return (
    <Root>
      <StyledTabs
        value={value}
        aria-label={ariaLabel}
        variant="scrollable"
        scrollButtons={'auto'}
        allowScrollButtonsMobile
      >
        {children}
        {showSettings && (
          <HeaderNavigationTab className="button-tab" icon={<SettingsOutlined />} value={'settings'} to={settingsUrl} />
        )}
      </StyledTabs>
    </Root>
  );
};
export default HeaderNavigationTabs;
