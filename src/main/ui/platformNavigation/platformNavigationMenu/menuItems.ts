import { ComponentType } from 'react';
import { SvgIconProps } from '@mui/material';
import TranslationKey from '../../../../core/i18n/utils/TranslationKey';
import InnovationLibraryIcon from '../../../topLevelPages/InnovationLibraryPage/InnovationLibraryIcon';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import { ChallengeIcon } from '../../../../domain/journey/challenge/icon/ChallengeIcon';
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

export default PLATFORM_NAVIGATION_MENU_ITEMS;
