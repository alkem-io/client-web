import { Box, Button, ButtonProps, Divider, MenuList, Paper, SvgIconProps } from '@mui/material';
import Gutters from '../../../core/ui/grid/Gutters';
import React, { ComponentType, forwardRef, PropsWithChildren } from 'react';
import RouterLink from '../../../core/ui/link/RouterLink';
import TranslationKey from '../../../core/i18n/utils/TranslationKey';
import InnovationLibraryIcon from '../../topLevelPages/InnovationLibraryPage/InnovationLibraryIcon';
import { ChallengeIcon } from '../../../domain/journey/challenge/icon/ChallengeIcon';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import { useTranslation } from 'react-i18next';
import { gutters } from '../../../core/ui/grid/utils';
import PoweredBy from '../poweredBy/PoweredBy';
import { ButtonTypeMap } from '@mui/material/Button/Button';
import { PLATFORM_NAVIGATION_MENU_ELEVATION } from './constants';

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

interface MenuItem {
  iconComponent: ComponentType<SvgIconProps>;
  route: string;
  label: TranslationKey;
}

const PLATFORM_NAVIGATION_MENU_ITEMS: MenuItem[] = [
  {
    label: 'pages.innovationLibrary.fullName',
    iconComponent: InnovationLibraryIcon,
    route: '/innovation-library',
  },
  {
    label: 'pages.forum.fullName',
    iconComponent: ForumOutlinedIcon,
    route: '/forum',
  },
  {
    label: 'pages.challenge-explorer.fullName',
    iconComponent: ChallengeIcon,
    route: '/challenges',
  },
  {
    label: 'pages.contributors.fullName',
    iconComponent: GroupOutlinedIcon,
    route: '/contributors',
  },
];

interface PlatformNavigationMenuProps {
  onClose?: () => void;
}

const PlatformNavigationMenu = forwardRef<HTMLDivElement, PlatformNavigationMenuProps>(({ onClose }, ref) => {
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
});

export default PlatformNavigationMenu;
