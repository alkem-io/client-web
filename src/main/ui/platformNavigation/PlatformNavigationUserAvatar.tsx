import React, { ReactElement, Ref } from 'react';
import { useUserContext } from '../../../domain/community/user';
import { Avatar, CircularProgress, useTheme } from '@mui/material';
import { Person } from '@mui/icons-material';
import { gutters } from '../../../core/ui/grid/utils';
import SwapColors from '../../../core/ui/palette/SwapColors';
import MenuTriggerButton from '../../../core/ui/tooltip/MenuTriggerButton';
import { PLATFORM_NAVIGATION_MENU_Z_INDEX } from './constants';
import NavigationItemContainer from '../../../core/ui/navigation/NavigationItemContainer';
import NavigationItemButton from '../../../core/ui/navigation/NavigationItemButton';
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
      renderTrigger={({ ref, ...props }) => (
        <SwapColors>
          <NavigationItemContainer ref={ref as Ref<HTMLDivElement>}>
            <NavigationItemButton
              component={Avatar}
              src={user?.user.profile.avatar?.uri}
              sx={{
                padding: 0,
                '&.Mui-focusVisible': {
                  filter: 'invert(1)',
                },
              }}
              aria-label={t('buttons.userMenu')}
              {...props}
            >
              {loadingMe && (
                <SwapColors>
                  <CircularProgress size={gutters()(theme)} color="primary" />
                </SwapColors>
              )}
              {!loadingMe && !isAuthenticated && <Person color="primary" />}
            </NavigationItemButton>
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
