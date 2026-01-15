import { ComponentType } from 'react';
import { SvgIconProps } from '@mui/material';
import TranslationKey from '@/core/i18n/utils/TranslationKey';
import InnovationLibraryIcon from '@/main/topLevelPages/InnovationLibraryPage/InnovationLibraryIcon';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import { SpaceL0Icon } from '@/domain/space/icons/SpaceL0Icon';
import { TopLevelRoutePath } from '@/main/routing/TopLevelRoutePath';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';

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
    iconComponent: SpaceL0Icon,
    route: '/spaces',
  },
  {
    label: 'pages.documentation.title',
    iconComponent: QuizOutlinedIcon,
    route: `/${TopLevelRoutePath.Docs}`,
  },
];

export default PLATFORM_NAVIGATION_MENU_ITEMS;
