import { Box, ButtonProps, Divider, MenuItem, MenuList, Paper, SvgIconProps } from '@mui/material';
import Gutters from '@/core/ui/grid/Gutters';
import React, { ComponentType, forwardRef, PropsWithChildren } from 'react';
import RouterLink from '@/core/ui/link/RouterLink';
import { useTranslation } from 'react-i18next';
import { gutters } from '@/core/ui/grid/utils';
import PoweredBy from '@/main/ui/poweredBy/PoweredBy';
import { ButtonTypeMap } from '@mui/material/Button/Button';
import { PLATFORM_NAVIGATION_MENU_ELEVATION } from '../constants';
import PLATFORM_NAVIGATION_MENU_ITEMS from './menuItems';
import { FocusTrap } from '@mui/base/FocusTrap';
import NavigatableMenuItem from '@/core/ui/menu/NavigatableMenuItem';
import { ExitToAppOutlined } from '@mui/icons-material';
import { Caption } from '@/core/ui/typography';

type PlatformNavigationMenuItemProps = {
  iconComponent: ComponentType<SvgIconProps>;
  route: string;
};

const PlatformNavigationMenuItem = <D extends React.ElementType = ButtonTypeMap['defaultComponent'], P = {}>({
  route,
  iconComponent: Icon,
  children,
  ...props
}: ButtonProps<D, P> & PropsWithChildren<PlatformNavigationMenuItemProps>) => (
  <MenuItem component={RouterLink} to={route} sx={{ padding: 0 }} {...props}>
    <Gutters alignItems="center" width={gutters(7)} paddingX={gutters(0.25)}>
      <Icon fontSize="large" />
      <Caption textAlign="center" sx={{ textWrap: 'wrap' }}>
        {children}
      </Caption>
    </Gutters>
  </MenuItem>
);

interface StandalonePlatformNavigationMenuProps {
  onClose?: () => void;
}

const StandalonePlatformNavigationMenu = forwardRef<HTMLDivElement, StandalonePlatformNavigationMenuProps>(
  ({ onClose }, ref) => {
    const { t } = useTranslation();

    return (
      <Paper ref={ref} elevation={PLATFORM_NAVIGATION_MENU_ELEVATION}>
        <FocusTrap open>
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
              <PlatformNavigationMenuItem key={label} {...props} onClick={onClose}>
                <>{t(label)}</>
              </PlatformNavigationMenuItem>
            ))}
            <Divider component="li" sx={{ width: '75%', marginY: 1 }} />
            <Box component={MenuItem} paddingY={gutters(0.5)}>
              <PoweredBy preview />
            </Box>
            <NavigatableMenuItem tabOnly iconComponent={ExitToAppOutlined} onClick={onClose}>
              {t('components.navigation.exitMenu')}
            </NavigatableMenuItem>
          </MenuList>
        </FocusTrap>
      </Paper>
    );
  }
);

export default StandalonePlatformNavigationMenu;
