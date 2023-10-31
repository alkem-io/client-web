import { Box, Button, ButtonProps, Divider, MenuList, Paper, SvgIconProps } from '@mui/material';
import Gutters from '../../../../core/ui/grid/Gutters';
import React, { ComponentType, forwardRef, PropsWithChildren } from 'react';
import RouterLink from '../../../../core/ui/link/RouterLink';
import { useTranslation } from 'react-i18next';
import { gutters } from '../../../../core/ui/grid/utils';
import PoweredBy from '../../poweredBy/PoweredBy';
import { ButtonTypeMap } from '@mui/material/Button/Button';
import { PLATFORM_NAVIGATION_MENU_ELEVATION } from '../constants';
import PLATFORM_NAVIGATION_MENU_ITEMS from './menuItems';

interface PlatformNavigationMenuItemProps {
  iconComponent: ComponentType<SvgIconProps>;
  route: string;
}

const PlatformNavigationMenuItem = <D extends React.ElementType = ButtonTypeMap['defaultComponent'], P = {}>({
  route,
  iconComponent: Icon,
  children,
  ...props
}: ButtonProps<D, P> & PropsWithChildren<PlatformNavigationMenuItemProps>) => {
  return (
    <Button component={RouterLink} to={route} sx={{ padding: 0 }} {...props}>
      <Gutters alignItems="center" width={gutters(7)} paddingX={gutters(0.25)} sx={{ textAlign: 'center' }}>
        <Icon fontSize="large" />
        {children}
      </Gutters>
    </Button>
  );
};

interface StandalonePlatformNavigationMenuProps {
  onClose?: () => void;
}

const StandalonePlatformNavigationMenu = forwardRef<HTMLDivElement, StandalonePlatformNavigationMenuProps>(
  ({ onClose }, ref) => {
    const { t } = useTranslation();

    return (
      <Paper ref={ref} elevation={PLATFORM_NAVIGATION_MENU_ELEVATION}>
        <MenuList
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            width: gutters(16),
            padding: gutters(),
            paddingBottom: gutters(0.5),
          }}
        >
          {PLATFORM_NAVIGATION_MENU_ITEMS.map(({ label, ...props }) => (
            <li key={label}>
              <PlatformNavigationMenuItem {...props} onClick={onClose}>
                {t(label)}
              </PlatformNavigationMenuItem>
            </li>
          ))}
          <Divider component="li" sx={{ width: '75%', marginY: 1 }} />
          <Box component="li" paddingY={gutters(0.5)}>
            <PoweredBy preview />
          </Box>
        </MenuList>
      </Paper>
    );
  }
);

export default StandalonePlatformNavigationMenu;
