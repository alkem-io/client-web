import { ComponentType } from 'react';
import { SvgIconProps } from '@mui/material';
import TranslationKey from '@/core/i18n/utils/TranslationKey';
import InnovationLibraryIcon from '@/main/topLevelPages/InnovationLibraryPage/InnovationLibraryIcon';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import { SpaceIcon } from '@/domain/journey/space/icon/SpaceIcon';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';

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
    label: 'pages.exploreSpaces.fullName',
    iconComponent: SpaceIcon,
    route: '/spaces',
  },
  {
    label: 'pages.contributors.fullName',
    iconComponent: GroupOutlinedIcon,
    route: '/contributors',
  },
];

export default PLATFORM_NAVIGATION_MENU_ITEMS;
