import React, { Ref } from 'react';
import NavigationItemContainer from '../../../core/ui/navigation/NavigationItemContainer';
import NavigationItemButton from '../../../core/ui/navigation/NavigationItemButton';
import MenuTriggerButton from '../../../core/ui/tooltip/MenuTriggerButton';
import StandalonePlatformNavigationMenu from './platformNavigationMenu/StandalonePlatformNavigationMenu';
import { PLATFORM_NAVIGATION_MENU_Z_INDEX } from './constants';
import { WidgetsRounded } from '@mui/icons-material';

const PlatformNavigationMenuButton = () => {
  return (
    <MenuTriggerButton
      placement="bottom-end"
      renderTrigger={({ ref, ...props }) => (
        <NavigationItemContainer ref={ref as Ref<HTMLDivElement>}>
          <NavigationItemButton color="primary" {...props}>
            <WidgetsRounded />
          </NavigationItemButton>
        </NavigationItemContainer>
      )}
      zIndex={PLATFORM_NAVIGATION_MENU_Z_INDEX}
    >
      <StandalonePlatformNavigationMenu />
    </MenuTriggerButton>
  );
};

export default PlatformNavigationMenuButton;
