import React, { FC, forwardRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from '@xstate/react';
import { AppBar, Box, Container, Theme } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LanguageIcon from '@mui/icons-material/Language';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import Collapse from '@mui/material/Collapse';
import ListItemText from '@mui/material/ListItemText';
import { useGlobalState, useUserContext } from '../../../../../hooks';
import useCurrentBreakpoint from '../../../../../hooks/useCurrentBreakpoint';
import { buildLoginUrl, buildUserProfileUrl } from '../../../../utils/urlBuilders';
import { RouterLink } from '../../../core/RouterLink';
import HideOnScroll from '../HideOnScroll';
import HelpIcon from './HelpIcon';
import LanguageSelect from './LanguageSelect';
import LogoComponent from './LogoComponent';
import SearchBar from './SearchBar';
import TopNavIcons from './TopNavIcons';
import { supportedLngs } from '../../../../../core/i18n/config';
import { ChallengeIcon } from '../../../../icons/ChallengeIcon';

const PREFIX = 'TopBar';

const classes = {
  bar: `${PREFIX}-bar`,
};

export const TopBarHeight = 9;

const Root = styled(AppBar)(({ theme }) => ({
  width: '100%',
  backgroundColor: theme.palette.common.white,
  boxShadow: '0px 1px 1px -1px rgb(0 0 0 / 20%), 0px 2px 5px 0px rgb(0 0 0 / 14%), 0px 1px 6px 0px rgb(0 0 0 / 12%)',
}));

const SearchBarGroup = styled(Box)(({ theme }) => ({
  alignSelf: 'right',
  '& > div': {
    marginRight: theme.spacing(1),
  },
}));

const TopBar = forwardRef<HTMLDivElement>((_, _ref) => {
  const {
    ui: { loginNavigationService },
  } = useGlobalState();

  const breakpoint = useCurrentBreakpoint();

  const loginVisible = useSelector(loginNavigationService, state => {
    return state.matches('visible');
  });

  const isBreakpointSm = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  if (!loginVisible) {
    return null;
  }

  return (
    <HideOnScroll>
      <Root position="fixed" className={classes.bar}>
        {isBreakpointSm ? (
          <MobileTopBar />
        ) : (
          <Container maxWidth={breakpoint}>
            <DesktopTopBar />
          </Container>
        )}
      </Root>
    </HideOnScroll>
  );
});

export const TopBarSpacer = () => {
  const theme = useTheme();

  return <Box height={theme.spacing(TopBarHeight)} sx={{ visibility: 'hidden' }}></Box>;
};

export default TopBar;

const DesktopTopBar = () => {
  return (
    <Box
      height={theme => theme.spacing(TopBarHeight)}
      display="flex"
      gap={2}
      alignItems="center"
      justifyContent="space-between"
    >
      <LogoComponent flexGrow={1} height={theme => theme.spacing(5)} />

      <SearchBarGroup
        sx={{
          display: { xs: 'none', md: 'flex' },
          marginRight: { xs: 0, lg: theme => theme.spacing(2), xl: theme => theme.spacing(5) },
        }}
      >
        <SearchBar />
        <LanguageSelect />
        <HelpIcon />
      </SearchBarGroup>

      <TopNavIcons />
    </Box>
  );
};

const MobileTopBar = () => {
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleOpen = useCallback((event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget), []);
  const handleClose = useCallback(() => setAnchorEl(null), []);
  const handleSearch = useCallback(() => navigate('/search'), []);

  return (
    <Box height={theme => theme.spacing(7)} display="flex" gap={2} alignItems="center" justifyContent="space-between">
      <HamburgerDropdown anchorEl={anchorEl} open={open} onOpen={handleOpen} onClose={handleClose} />

      <LogoComponent height={theme => theme.spacing(4)} />

      <IconButton sx={{ mr: 2 }} size="small" onClick={handleSearch}>
        <SearchIcon />
      </IconButton>
    </Box>
  );
};

interface HamburgerDropdownProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onOpen: (event: React.MouseEvent<HTMLElement>) => void;
  onClose: () => void;
}

const HamburgerDropdown: FC<HamburgerDropdownProps> = ({ anchorEl, open, onOpen, onClose }) => {
  const { t, i18n } = useTranslation();

  const { pathname } = useLocation();
  const { isAuthenticated, user: userMetadata } = useUserContext();
  const user = userMetadata?.user;
  const isAdmin = userMetadata?.isAdmin;

  const [languageOpen, setLanguageOpen] = React.useState(false);
  const [selectedLang, setSelectedLang] = React.useState(i18n.language);

  const handleLanguageExpand = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setLanguageOpen(state => !state);
  }, []);

  const handleLanguageSelection = useCallback(language => {
    i18n.changeLanguage(language);
    setSelectedLang(language);
  }, []);

  return (
    <>
      <IconButton
        aria-label="hamburger menu"
        aria-haspopup="true"
        aria-controls={open ? 'account-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        onClick={onOpen}
        sx={{ ml: 2 }}
        size="small"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={onClose}
        onClick={onClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 0, vertical: 47 }}
        MenuListProps={{ dense: false }}
      >
        {!isAuthenticated && (
          <>
            <MenuItem component={RouterLink} to={buildLoginUrl(pathname)}>
              <ListItemIcon>
                <ExitToAppIcon />
              </ListItemIcon>
              {t('authentication.sign-in')}
            </MenuItem>
            <Divider />
          </>
        )}
        <MenuItem component={RouterLink} to="/challenges">
          <ListItemIcon>
            <ChallengeIcon />
          </ListItemIcon>
          {t('common.challenges')}
        </MenuItem>
        <MenuItem component={RouterLink} to="/contributors">
          <ListItemIcon>
            <GroupOutlinedIcon />
          </ListItemIcon>
          {t('common.contributors')}
        </MenuItem>
        {user && (
          <MenuItem component={RouterLink} to={buildUserProfileUrl(user.nameID)}>
            <ListItemIcon>
              <AssignmentIndOutlinedIcon />
            </ListItemIcon>
            {t('common.my-profile')}
          </MenuItem>
        )}
        {isAdmin && (
          <MenuItem component={RouterLink} to="/admin">
            <ListItemIcon>
              <SettingsOutlinedIcon />
            </ListItemIcon>
            {t('common.admin')}
          </MenuItem>
        )}
        <Divider variant="middle" />
        {isAuthenticated && (
          <MenuItem component={RouterLink} to="/identity/logout">
            <ListItemIcon>
              <MeetingRoomOutlinedIcon />
            </ListItemIcon>
            {t('authentication.sign-out')}
          </MenuItem>
        )}
        <MenuItem component={RouterLink} to="/help">
          <ListItemIcon>
            <HelpOutlineIcon />
          </ListItemIcon>
          {t('common.help')}
        </MenuItem>
        <MenuItem onClick={handleLanguageExpand}>
          <ListItemIcon>
            <LanguageIcon />
          </ListItemIcon>
          {t('common.language')}
          <Box sx={{ ml: 1, mt: 0.5, display: 'flex', alignItems: 'center' }}>
            {languageOpen ? <ExpandLess /> : <ExpandMore />}
          </Box>
        </MenuItem>
        <Collapse in={languageOpen} timeout="auto" unmountOnExit>
          {supportedLngs.map(x => (
            <MenuItem key={x} onClick={() => handleLanguageSelection(x)} selected={x === selectedLang}>
              <ListItemText primary={x} />
            </MenuItem>
          ))}
        </Collapse>
      </Menu>
    </>
  );
};
