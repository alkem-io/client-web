import { useTranslation } from 'react-i18next';
import NavigatableMenuItem from '@/core/ui/menu/NavigatableMenuItem';
import PLATFORM_NAVIGATION_MENU_ITEMS from './menuItems';

const UserMenuPlatformNavigationSegment = () => {
  const { t } = useTranslation();

  return (
    <>
      {PLATFORM_NAVIGATION_MENU_ITEMS.map(({ label, ...props }) => (
        <NavigatableMenuItem key={props.route} {...props}>
          {t(label)}
        </NavigatableMenuItem>
      ))}
    </>
  );
};

export default UserMenuPlatformNavigationSegment;
