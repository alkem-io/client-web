import React, { Ref } from 'react';
import { ReactComponent as AlkemioLogo } from '../logo/logoSmall.svg';
import NavigationItemContainer from '../../../core/ui/navigation/NavigationItemContainer';
import { gutters } from '../../../core/ui/grid/utils';
import NavigationItemButton from '../../../core/ui/navigation/NavigationItemButton';
import MenuTriggerButton from '../../../core/ui/tooltip/MenuTriggerButton';
import StandalonePlatformNavigationMenu from './platformNavigationMenu/StandalonePlatformNavigationMenu';
import { PLATFORM_NAVIGATION_MENU_Z_INDEX } from './constants';

const PlatformNavigationMenuButton = () => {
  return (
    <MenuTriggerButton
      placement="bottom-end"
      renderTrigger={({ ref, ...props }) => (
        <NavigationItemContainer ref={ref as Ref<HTMLDivElement>}>
          <NavigationItemButton
            sx={{ height: gutters(2), width: gutters(2.5), svg: { height: gutters(2) } }}
            {...props}
          >
            <AlkemioLogo />
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
