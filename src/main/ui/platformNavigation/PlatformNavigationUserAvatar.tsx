import React from 'react';
import { useUserContext } from '../../../domain/community/user';
import { Avatar, CircularProgress, useTheme } from '@mui/material';
import { Person } from '@mui/icons-material';
import { gutters } from '../../../core/ui/grid/utils';
import SwapColors from '../../../core/ui/palette/SwapColors';

const PlatformNavigationUserAvatar = () => {
  const { user, isAuthenticated, loadingMe } = useUserContext();

  const theme = useTheme();

  return (
    <Avatar src={user?.user.profile.visual?.uri}>
      {loadingMe && (
        <SwapColors>
          <CircularProgress size={gutters()(theme)} color="primary" />
        </SwapColors>
      )}
      {!loadingMe && !isAuthenticated && <Person />}
    </Avatar>
  );
};

export default PlatformNavigationUserAvatar;
