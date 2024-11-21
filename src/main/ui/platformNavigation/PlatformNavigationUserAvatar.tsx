import React, { ReactElement, Ref } from 'react';
import { useUserContext } from '@/domain/community/user';
import { Box, CircularProgress, Paper, useTheme } from '@mui/material';
import Avatar from '@/core/ui/avatar/Avatar';
import { Person } from '@mui/icons-material';
import { gutters } from '@/core/ui/grid/utils';
import SwapColors from '@/core/ui/palette/SwapColors';
import MenuTriggerButton from '@/core/ui/tooltip/MenuTriggerButton';
import { PLATFORM_NAVIGATION_MENU_Z_INDEX } from './constants';
import NavigationItemContainer from '@/core/ui/navigation/NavigationItemContainer';
import { useTranslation } from 'react-i18next';

interface PlatformNavigationUserAvatarProps {
  children: ReactElement<{ onClose?: () => void }>;
  drawer?: boolean;
}

const PlatformNavigationUserAvatar = ({ drawer, children }: PlatformNavigationUserAvatarProps) => {
  const { t } = useTranslation();
  const { user, isAuthenticated, loadingMe } = useUserContext();

  const theme = useTheme();

  return (
    <MenuTriggerButton
      keepMounted
      drawer={drawer}
      placement="bottom-end"
      renderTrigger={({ ref, onClick, ...props }) => (
        <SwapColors>
          <NavigationItemContainer ref={ref as Ref<HTMLDivElement>} position="relative">
            <Paper
              component={Avatar}
              src={user?.user.profile.avatar?.uri}
              sx={{
                padding: 0,
                cursor: 'pointer',
              }}
              aria-label={t('buttons.userMenu')}
              onClick={onClick}
              {...props}
            >
              {loadingMe && (
                <SwapColors>
                  <CircularProgress size={gutters()(theme)} color="primary" />
                </SwapColors>
              )}
              {!loadingMe && !isAuthenticated && <Person color="primary" />}
            </Paper>
            <Box
              position="absolute"
              top={0}
              bottom={0}
              left={0}
              right={0}
              padding={gutters(0.25)}
              display="flex"
              alignItems="stretch"
              sx={{ pointerEvents: 'none' }}
            >
              <Box
                component="a"
                flexGrow={1}
                href=""
                onClick={event => {
                  event.preventDefault();
                  onClick?.(event);
                }}
              />
            </Box>
          </NavigationItemContainer>
        </SwapColors>
      )}
      zIndex={PLATFORM_NAVIGATION_MENU_Z_INDEX}
    >
      {children}
    </MenuTriggerButton>
  );
};

export default PlatformNavigationUserAvatar;
