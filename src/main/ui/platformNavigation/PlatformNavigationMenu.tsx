import { Button, Paper, SvgIconProps } from '@mui/material';
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
    <Button component={RouterLink} to={route}>
      <Gutters alignItems="center" width={gutters(12)}>
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
    label: 'common.challenges',
    iconComponent: ChallengeIcon,
    route: '/challenges',
  },
  {
    label: 'common.contributors',
    iconComponent: GroupOutlinedIcon,
    route: '/contributors',
  },
  {
    label: 'common.forum',
    iconComponent: ForumOutlinedIcon,
    route: '/forum',
  },
];

const PlatformNavigationMenu = () => {
  const { t } = useTranslation();

  return (
    <Paper>
      <Gutters row width={gutters(30)} flexWrap="wrap">
        {PLATFORM_NAVIGATION_MENU_ITEMS.map(({ label, ...props }) => (
          <PlatformNavigationMenuItem key={label} {...props}>
            {t(label)}
          </PlatformNavigationMenuItem>
        ))}
      </Gutters>
    </Paper>
  );
};

export default PlatformNavigationMenu;
