import { SettingsOutlined } from '@mui/icons-material';
import { ShareOutlined } from '@mui/icons-material';
import { Box, styled, Tabs, TabsProps } from '@mui/material';
import { FC } from 'react';
import HeaderNavigationButton from './HeaderNavigationButton';
import HeaderNavigationTab from './HeaderNavigationTab';

const Root = styled(Box)(({ theme }) => ({
  position: 'relative',
  '& .MuiTab-root.settings-button': {
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
        <HeaderNavigationButton className="share-button" icon={<ShareOutlined />} value={'share'} />
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
