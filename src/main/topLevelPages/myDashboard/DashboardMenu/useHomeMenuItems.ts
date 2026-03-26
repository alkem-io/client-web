import DrawOutlinedIcon from '@mui/icons-material/DrawOutlined';
import EmojiObjectsOutlinedIcon from '@mui/icons-material/EmojiObjectsOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { buildUserAccountUrl } from '@/main/routing/urlBuilders';
import { DashboardDialog } from '../DashboardDialogs/DashboardDialogsProps';
import { useCreateSpaceLink } from '../useCreateSpaceLink/useCreateSpaceLink';
import type { MenuOptionProps } from './dashboardMenuTypes';

export const useHomeMenuItems = () => {
  const { userModel, loading } = useCurrentUserContext();
  const { link: createSpaceLink, loading: loadingLink } = useCreateSpaceLink();

  const dashboardMenuItems: MenuOptionProps[] = [
    {
      label: 'pages.home.mainNavigation.invitations',
      type: 'invites',
      icon: MailOutlineOutlinedIcon,
      isVisible: (_, __) => true,
    },
    {
      label: 'pages.home.mainNavigation.myLatestActivity',
      type: 'dialog',
      icon: DrawOutlinedIcon,
      isVisible: (viewEnabled, compactMode) => !compactMode && !viewEnabled,
      dialog: DashboardDialog.MyActivity,
    },
    {
      label: 'pages.home.mainNavigation.myLatestSpacesActivity',
      type: 'dialog',
      icon: HistoryOutlinedIcon,
      isVisible: (viewEnabled, compactMode) => !compactMode && !viewEnabled,
      dialog: DashboardDialog.MySpaceActivity,
    },
    {
      label: '',
      type: 'divider',
      isVisible: (_, __) => true,
    },
    {
      label: 'pages.home.mainNavigation.tipsAndTricks',
      type: 'dialog',
      icon: EmojiObjectsOutlinedIcon,
      isVisible: (_, __) => true,
      dialog: DashboardDialog.TipsAndTricks,
    },
    {
      label: 'pages.home.mainNavigation.myAccount',
      type: 'link',
      to: buildUserAccountUrl(userModel?.profile?.url),
      icon: LocalOfferOutlinedIcon,
      isVisible: (_, __) => true,
    },
    {
      label: 'pages.home.mainNavigation.createSpace',
      type: 'link',
      to: loadingLink ? '' : createSpaceLink,
      icon: RocketLaunchOutlinedIcon,
      isVisible: (_, __) => true,
    },
    {
      label: '',
      type: 'divider',
      isVisible: (_, compactMode) => !compactMode,
    },
    {
      label: 'pages.home.mainNavigation.activityView',
      type: 'switch',
      isVisible: (_, compactMode) => !compactMode,
    },
  ];

  return { items: dashboardMenuItems, loading };
};
