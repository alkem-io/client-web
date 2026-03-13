import { ExitToAppOutlined } from '@mui/icons-material';
import { Box, type ButtonProps, Divider, MenuItem, MenuList, Paper, type SvgIconProps } from '@mui/material';
import type { ButtonTypeMap } from '@mui/material/Button/Button';
import FocusTrap from '@mui/material/Unstable_TrapFocus';
import type React from 'react';
import type { ComponentType, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import RouterLink from '@/core/ui/link/RouterLink';
import NavigatableMenuItem from '@/core/ui/menu/NavigatableMenuItem';
import { Caption } from '@/core/ui/typography';
import PoweredBy from '@/main/ui/poweredBy/PoweredBy';
import { PLATFORM_NAVIGATION_MENU_ELEVATION } from '../constants';
import PLATFORM_NAVIGATION_MENU_ITEMS from './menuItems';

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

const StandalonePlatformNavigationMenu = ({
  ref,
  onClose,
}: StandalonePlatformNavigationMenuProps & {
  ref?: React.Ref<HTMLDivElement>;
}) => {
  const { t } = useTranslation();

  return (
    <Paper ref={ref} elevation={PLATFORM_NAVIGATION_MENU_ELEVATION}>
      <FocusTrap open={true}>
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
              {t(label)}
            </PlatformNavigationMenuItem>
          ))}
          <Divider component="li" sx={{ width: '75%', marginY: 1 }} />
          <Box component={MenuItem} paddingY={gutters(0.5)}>
            <PoweredBy preview={true} />
          </Box>
          <NavigatableMenuItem tabOnly={true} iconComponent={ExitToAppOutlined} onClick={onClose}>
            {t('components.navigation.exitMenu')}
          </NavigatableMenuItem>
        </MenuList>
      </FocusTrap>
    </Paper>
  );
};

export default StandalonePlatformNavigationMenu;
