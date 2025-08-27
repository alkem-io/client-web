import React, { ReactElement, Ref } from 'react';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { Box, CircularProgress, Paper, useTheme } from '@mui/material';
import Avatar from '@/core/ui/avatar/Avatar';
import { Person } from '@mui/icons-material';
import { gutters } from '@/core/ui/grid/utils';
import SwapColors from '@/core/ui/palette/SwapColors';
import MenuTriggerButton from '@/core/ui/tooltip/MenuTriggerButton';
import { PLATFORM_NAVIGATION_MENU_Z_INDEX } from './constants';
import NavigationItemContainer from '@/core/ui/navigation/NavigationItemContainer';
import { useTranslation } from 'react-i18next';
import BadgeLabel from '@/core/ui/icon/BadgeLabel';
import { RoleName } from '@/core/apollo/generated/graphql-schema';

interface PlatformNavigationUserAvatarProps {
  children: ReactElement<{ onClose?: () => void }>;
  drawer?: boolean;
}

const PlatformNavigationUserAvatar = ({ drawer, children }: PlatformNavigationUserAvatarProps) => {
  const { t } = useTranslation();
  const { userModel, isAuthenticated, loadingMe, platformRoles } = useCurrentUserContext();

  const theme = useTheme();

  const showBetaBadge = userModel && isAuthenticated && platformRoles.includes(RoleName.PlatformBetaTester);

  return (
    <MenuTriggerButton
      keepMounted
      drawer={drawer}
      placement="bottom-end"
      renderTrigger={({ ref, onClick, ...props }) => (
        <SwapColors>
          <NavigationItemContainer ref={ref as Ref<HTMLDivElement>} position="relative" overflow="visible">
            <Paper
              component={Avatar}
              src={userModel?.profile.avatar?.uri}
              sx={{
                padding: 0,
                cursor: 'pointer',
                position: 'relative',
              }}
              alt={t('buttons.userMenu')}
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
            {showBetaBadge && (
              <BadgeLabel
                count="Beta"
                size="small"
                sx={{
                  position: 'absolute',
                  bottom: '-8px',
                  right: '-12px',
                  zIndex: PLATFORM_NAVIGATION_MENU_Z_INDEX + 1,
                }}
              />
            )}
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
                aria-label={t('common.my-profile')}
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
