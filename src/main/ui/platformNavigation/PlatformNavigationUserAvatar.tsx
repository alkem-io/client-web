import React, { Ref } from 'react';
import { useUserContext } from '../../../domain/community/user';
import { Avatar, Box, CircularProgress, ClickAwayListener, Grow, useTheme } from '@mui/material';
import { Person } from '@mui/icons-material';
import { gutters } from '../../../core/ui/grid/utils';
import SwapColors from '../../../core/ui/palette/SwapColors';
import ClickableTooltip from '../../../core/ui/tooltip/ClickableTooltip';
import PlatformNavigationUserMenu from './PlatformNavigationUserMenu';
import { PLATFORM_NAVIGATION_MENU_Z_INDEX } from './constants';

const PlatformNavigationUserAvatar = () => {
  const { user, isAuthenticated, loadingMe } = useUserContext();

  const theme = useTheme();

  return (
    <ClickableTooltip
      keepMounted
      placement="bottom-end"
      renderTrigger={({ ref, ...props }) => (
        <Avatar
          ref={ref as Ref<HTMLDivElement>}
          src={user?.user.profile.visual?.uri}
          sx={{ cursor: 'pointer' }}
          {...props}
        >
          {loadingMe && (
            <SwapColors>
              <CircularProgress size={gutters()(theme)} color="primary" />
            </SwapColors>
          )}
          {!loadingMe && !isAuthenticated && <Person />}
        </Avatar>
      )}
      zIndex={PLATFORM_NAVIGATION_MENU_Z_INDEX}
    >
      {({ onClose, onClickAway, TransitionProps }) => (
        <Grow
          {...TransitionProps}
          style={{
            transformOrigin: 'right top',
          }}
        >
          <Box padding={gutters(0.5)} paddingRight={0}>
            <ClickAwayListener onClickAway={onClickAway}>
              <PlatformNavigationUserMenu onClose={onClose} />
            </ClickAwayListener>
          </Box>
        </Grow>
      )}
    </ClickableTooltip>
  );
};

export default PlatformNavigationUserAvatar;
