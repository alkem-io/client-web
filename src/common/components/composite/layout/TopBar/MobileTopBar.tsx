import { Box, ClickAwayListener, Collapse, useTheme } from '@mui/material';
import { Link, useLocation, useMatch, useNavigate } from 'react-router-dom';
import React, { FC, useCallback, useState } from 'react';
import LogoComponent from './LogoComponent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import { useUserContext } from '../../../../../domain/community/contributor/user/hooks/useUserContext';
import MenuIcon from '@mui/icons-material/Menu';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { RouterLink } from '../../../core/RouterLink';
import { buildLoginUrl, buildUserProfileUrl } from '../../../../utils/urlBuilders';
import ListItemIcon from '@mui/material/ListItemIcon';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import Divider from '@mui/material/Divider';
import { ChallengeIcon } from '../../../../../domain/challenge/challenge/icon/ChallengeIcon';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import { SEARCH_ROUTE } from '../../../../../domain/platform/routes/constants';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LanguageIcon from '@mui/icons-material/Language';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { supportedLngs } from '../../../../../core/i18n/config';
import ListItemText from '@mui/material/ListItemText';
import SearchBar from './SearchBar';
import { ReactComponent as LogoSmallImage } from './alkemio-logo-small.svg';
import { ROUTE_HOME } from '../../../../../domain/platform/routes/constants';
import HelpDialog from '../../../../../core/help/dialog/HelpDialog';
import { gutters } from '../../../../../core/ui/grid/utils';

export const MobileTopBarHeightGutters = 3;

const MobileTopBar = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);
  const openMenu = useCallback((event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget), []);
  const closeMenu = useCallback(() => setAnchorEl(null), []);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => {
    setIsSearchOpen(false);
    if (searchRouteMatch) {
      navigate(SEARCH_ROUTE, { replace: true });
    }
  };

  const searchRouteMatch = useMatch(SEARCH_ROUTE);
  const navigate = useNavigate();

  return (
    <Box
      height={gutters(MobileTopBarHeightGutters)}
      display="flex"
      gap={2}
      alignItems="center"
      justifyContent="space-between"
    >
      {!isSearchOpen && (
        <HamburgerDropdown anchorEl={anchorEl} open={isMenuOpen} onOpen={openMenu} onClose={closeMenu} />
      )}

      {isSearchOpen ? <LogoSmall /> : <LogoComponent height={theme => theme.spacing(4)} />}

      {isSearchOpen && (
        <ClickAwayListener onClickAway={closeSearch}>
          <SearchBar />
        </ClickAwayListener>
      )}

      <IconButton sx={{ mr: 2 }} size="small" onClick={isSearchOpen ? closeSearch : openSearch}>
        {isSearchOpen ? <CloseIcon /> : <SearchIcon />}
      </IconButton>
    </Box>
  );
};

const LogoSmall = () => {
  const theme = useTheme();

  return (
    <Box component={Link} mx={1} to={ROUTE_HOME}>
      <LogoSmallImage width={theme.spacing(6)} />
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
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const user = userMetadata?.user;
  const isAdmin = userMetadata?.permissions.isAdmin;

  const [languageOpen, setLanguageOpen] = React.useState(false);
  const [selectedLang, setSelectedLang] = React.useState(i18n.language);

  const handleLanguageExpand = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setLanguageOpen(state => !state);
  }, []);

  const handleLanguageSelection = useCallback(
    language => {
      i18n.changeLanguage(language);
      setSelectedLang(language);
    },
    [i18n]
  );

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
              {t('topbar.sign-in')}
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
        <MenuItem component={RouterLink} to="/forum">
          <ListItemIcon>
            <ForumOutlinedIcon />
          </ListItemIcon>
          {t('common.forum')}
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
        <MenuItem onClick={() => setHelpDialogOpen(true)}>
          <ListItemIcon>
            <HelpOutlineIcon />
          </ListItemIcon>
          {t('common.help')}
        </MenuItem>
        <MenuItem onClick={handleLanguageExpand}>
          <ListItemIcon>
            <LanguageIcon />
          </ListItemIcon>
          Language
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
      <HelpDialog open={helpDialogOpen} onClose={() => setHelpDialogOpen(false)} />
    </>
  );
};

export default MobileTopBar;
