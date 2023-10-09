import { Button, Divider, Paper, SvgIconProps } from '@mui/material';
import Gutters from '../../../core/ui/grid/Gutters';
import React, { ComponentType, PropsWithChildren } from 'react';
import RouterLink from '../../../core/ui/link/RouterLink';
import TranslationKey from '../../../core/i18n/utils/TranslationKey';
import InnovationLibraryIcon from '../../topLevelPages/InnovationLibraryPage/InnovationLibraryIcon';
import { ChallengeIcon } from '../../../domain/journey/challenge/icon/ChallengeIcon';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import { useTranslation } from 'react-i18next';
import { gutters } from '../../../core/ui/grid/utils';
import PoweredBy from '../poweredBy/PoweredBy';

interface PlatformNavigationMenuItemProps {
  iconComponent: ComponentType<SvgIconProps>;
  route: string;
}

const PlatformNavigationMenuItem = ({
  route,
  iconComponent: Icon,
  children,
}: PropsWithChildren<PlatformNavigationMenuItemProps>) => {
  return (
    <Button component={RouterLink} to={route} sx={{ padding: 0 }}>
      <Gutters alignItems="center" width={gutters(7)}>
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
    label: 'pages.innovationLibrary.shortName',
    iconComponent: InnovationLibraryIcon,
    route: '/innovation-library',
  },
  {
    label: 'common.forum',
    iconComponent: ForumOutlinedIcon,
    route: '/forum',
  },
  {
    label: 'common.challenges',
    iconComponent: ChallengeIcon,
    route: '/challenges',
  },
  {
    label: 'common.contributors',
    iconComponent: GroupOutlinedIcon,
    route: '/contributors',
  },
];

const PlatformNavigationMenu = () => {
  const { t } = useTranslation();

  return (
    <Paper>
      <Gutters row disableGap paddingBottom={1} width={gutters(16)} flexWrap="wrap" justifyContent="center">
        {PLATFORM_NAVIGATION_MENU_ITEMS.map(({ label, ...props }) => (
          <PlatformNavigationMenuItem key={label} {...props}>
            {t(label)}
          </PlatformNavigationMenuItem>
        ))}
        <Divider sx={{ width: '75%', marginY: 1 }} />
        <PoweredBy />
      </Gutters>
    </Paper>
  );
};

export default PlatformNavigationMenu;
