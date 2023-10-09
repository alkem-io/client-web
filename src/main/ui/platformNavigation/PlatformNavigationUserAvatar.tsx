import React, { forwardRef } from 'react';
import { useUserContext } from '../../../domain/community/user';
import { Avatar, Box, CircularProgress, useTheme } from '@mui/material';
import { Person } from '@mui/icons-material';
import { gutters } from '../../../core/ui/grid/utils';
import SwapColors from '../../../core/ui/palette/SwapColors';
import ClickableTooltip from '../../../core/ui/tooltip/ClickableTooltip';
import PlatformNavigationUserMenu from './PlatformNavigationUserMenu';

const Wrapper = forwardRef((props, ref) => <Box ref={ref} padding={gutters(0.5)} {...props} />);

const PlatformNavigationUserAvatar = () => {
  const { user, isAuthenticated, loadingMe } = useUserContext();

  const theme = useTheme();

  return (
    <ClickableTooltip
      components={{
        Tooltip: Wrapper,
      }}
      title={<PlatformNavigationUserMenu />}
    >
      {({ onClick }) => (
        <Avatar src={user?.user.profile.visual?.uri} onClick={onClick} sx={{ cursor: 'pointer' }}>
          {loadingMe && (
            <SwapColors>
              <CircularProgress size={gutters()(theme)} color="primary" />
            </SwapColors>
          )}
          {!loadingMe && !isAuthenticated && <Person />}
        </Avatar>
      )}
    </ClickableTooltip>
  );
};

export default PlatformNavigationUserAvatar;
