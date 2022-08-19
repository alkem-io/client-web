import { SettingsOutlined } from '@mui/icons-material';
import { Box, styled, Tabs, TabsProps } from '@mui/material';
import { FC } from 'react';
import HeaderNavigationTab from './HeaderNavigationTab';

const Root = styled(Box)(({ theme }) => ({
  position: 'relative',
  '& .MuiTab-root.settings-button': {
    flex: 'initial',
    minWidth: 24,
  },
  '& .MuiTabs-root': {
    paddingLeft: theme.spacing(2),
    paddingRight: 0,
    [theme.breakpoints.only('xs')]: {
      paddingLeft: 1,
      paddingRight: 1,
    },
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  minHeight: 0,
  color: theme.palette.common.white,
  backgroundColor: theme.palette.primary.main,
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.common.white,
    bottom: 2,
    height: 2,
  },
  '& .MuiTab-root': {
    fontSize: theme.typography.button.fontSize,
    flexGrow: 1,
    minHeight: theme.spacing(5),
    top: -2,
  },
}));

export interface NavigationTabsProps extends TabsProps {
  showSettings?: boolean;
  settingsUrl?: string;
}

const HeaderNavigationTabs: FC<NavigationTabsProps> = ({
  value,
  'aria-label': ariaLabel,
  showSettings = false,
  settingsUrl = '',
  children,
}) => {
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
          <HeaderNavigationTab
            className="settings-button"
            icon={<SettingsOutlined />}
            value={'settings'}
            to={settingsUrl}
          />
        )}
      </StyledTabs>
    </Root>
  );
};
export default HeaderNavigationTabs;
