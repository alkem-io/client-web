import React, { ReactElement, Ref } from 'react';
import { useUserContext } from '../../../domain/community/user';
import { Avatar, CircularProgress, Paper, useTheme } from '@mui/material';
import { Person } from '@mui/icons-material';
import { gutters } from '../../../core/ui/grid/utils';
import SwapColors from '../../../core/ui/palette/SwapColors';
import MenuTriggerButton from '../../../core/ui/tooltip/MenuTriggerButton';
import { PLATFORM_NAVIGATION_MENU_Z_INDEX } from './constants';
import { useElevationContext } from '../../../core/ui/utils/ElevationContext';

interface PlatformNavigationUserAvatarProps {
  children: ReactElement<{ onClose?: () => void }>;
  drawer?: boolean;
}

const PlatformNavigationUserAvatar = ({ drawer, children }: PlatformNavigationUserAvatarProps) => {
  const { user, isAuthenticated, loadingMe } = useUserContext();

  const theme = useTheme();

  const elevation = useElevationContext();

  return (
    <MenuTriggerButton
      keepMounted
      drawer={drawer}
      placement="bottom-end"
      renderTrigger={({ ref, ...props }) => (
        <Paper ref={ref as Ref<HTMLDivElement>} sx={{ cursor: 'pointer' }} elevation={elevation}>
          <Avatar ref={ref as Ref<HTMLDivElement>} src={user?.user.profile.avatar?.uri} variant="square" {...props}>
            {loadingMe && (
              <SwapColors>
                <CircularProgress size={gutters()(theme)} color="primary" />
              </SwapColors>
            )}
            {!loadingMe && !isAuthenticated && <Person />}
          </Avatar>
        </Paper>
      )}
      zIndex={PLATFORM_NAVIGATION_MENU_Z_INDEX}
    >
      {children}
    </MenuTriggerButton>
  );
};

export default PlatformNavigationUserAvatar;
