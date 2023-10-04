import React from 'react';
import { useUserContext } from '../../../domain/community/user';
import { Avatar, Box, CircularProgress, useTheme } from '@mui/material';
import { Person } from '@mui/icons-material';
import { gutters } from '../../../core/ui/grid/utils';
import SwapColors from '../../../core/ui/palette/SwapColors';

const PlatformNavigationUserAvatar = () => {
  const { user, isAuthenticated, loadingMe } = useUserContext();

  const theme = useTheme();

  return (
    <Box padding={gutters(0.5)}>
      <Avatar src={user?.user.profile.visual?.uri}>
        {loadingMe && (
          <SwapColors>
            <CircularProgress size={gutters()(theme)} color="primary" />
          </SwapColors>
        )}
        {!loadingMe && !isAuthenticated && <Person />}
      </Avatar>
    </Box>
  );
};

export default PlatformNavigationUserAvatar;
