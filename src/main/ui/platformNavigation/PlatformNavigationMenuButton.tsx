import React, { Ref } from 'react';
import NavigationItemContainer from '@core/ui/navigation/NavigationItemContainer';
import NavigationItemButton from '@core/ui/navigation/NavigationItemButton';
import MenuTriggerButton from '@core/ui/tooltip/MenuTriggerButton';
import StandalonePlatformNavigationMenu from './platformNavigationMenu/StandalonePlatformNavigationMenu';
import { PLATFORM_NAVIGATION_MENU_Z_INDEX } from './constants';
import { WidgetsRounded } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const PlatformNavigationMenuButton = () => {
  const { t } = useTranslation();
  return (
    <MenuTriggerButton
      placement="bottom-end"
      renderTrigger={({ ref, ...props }) => (
        <NavigationItemContainer ref={ref as Ref<HTMLDivElement>}>
          <NavigationItemButton color="primary" {...props} aria-label={t('buttons.toolsMenu')}>
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
