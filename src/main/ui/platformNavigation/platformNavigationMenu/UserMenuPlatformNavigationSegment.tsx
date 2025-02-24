import PLATFORM_NAVIGATION_MENU_ITEMS from './menuItems';
import NavigatableMenuItem from '@/core/ui/menu/NavigatableMenuItem';
import React from 'react';
import { useTranslation } from 'react-i18next';

const UserMenuPlatformNavigationSegment = () => {
  const { t } = useTranslation();

  return (
    <>
      {PLATFORM_NAVIGATION_MENU_ITEMS.map(({ label, ...props }) => (
        <NavigatableMenuItem key={props.route} {...props}>
          <>{t(label)}</>
        </NavigatableMenuItem>
      ))}
    </>
  );
};

export default UserMenuPlatformNavigationSegment;
