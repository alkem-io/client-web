import { SettingsOutlined } from '@mui/icons-material';
import { Box, styled, Tabs, TabsProps } from '@mui/material';
import { FC } from 'react';
import HeaderNavigationTab from './HeaderNavigationTab';

const Root = styled(Box)(({ theme }) => ({
  position: 'relative',
  '.MuiTab-root.settings-button': {
    color: theme.palette.common.white,
    position: 'absolute',
    top: 0,
    right: 0,
    minHeight: theme.spacing(5),
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  minHeight: 0,
  color: theme.palette.common.white,
  backgroundColor: theme.palette.primary.main,
  [theme.breakpoints.up('xs')]: {
    paddingLeft: 0,
    paddingRight: theme.spacing(5),
  },
  [theme.breakpoints.up('lg')]: {
    paddingLeft: theme.spacing(8),
    paddingRight: theme.spacing(8),
  },
  '& .MuiTabs-scroller': {
    overflowX: 'visible',
    overflowY: 'visible',
  },
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.common.white,
    bottom: 2,
    height: 2,
  },
  '& .MuiTabs-flexContainer': {
    display: 'flex',
    justifyContent: 'center',
  },
  '& .MuiTab-root': {
    fontSize: theme.typography.button.fontSize,
    flexGrow: 1,
    minHeight: theme.spacing(5),
    position: 'relative',
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
      </StyledTabs>
      {showSettings && (
        <HeaderNavigationTab
          className="settings-button"
          icon={<SettingsOutlined />}
          value={'settings'}
          to={settingsUrl}
        />
      )}
    </Root>
  );
};
export default HeaderNavigationTabs;
