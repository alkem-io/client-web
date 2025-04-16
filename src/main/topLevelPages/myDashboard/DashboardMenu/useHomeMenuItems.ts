import { useMemo } from 'react';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import EmojiObjectsOutlinedIcon from '@mui/icons-material/EmojiObjectsOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import DrawOutlinedIcon from '@mui/icons-material/DrawOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import { useCurrentUserContext } from '@/domain/community/user';
import { getAccountLink } from '@/main/routing/urlBuilders';
import { MenuOptionProps } from './dashboardMenuTypes';
import { DashboardDialog } from '../DashboardDialogs/DashboardDialogsProps';
import { useCreateSpaceLink } from '../useCreateSpaceLink/useCreateSpaceLink';

export const useHomeMenuItems = () => {
  const { user, loading } = useCurrentUserContext();
  const { link: createSpaceLink, loading: loadingLink } = useCreateSpaceLink();

  const dashboardMenuItems: MenuOptionProps[] = useMemo(
    () => [
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
        to: getAccountLink(user?.user.profile?.url),
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
    ],
    [user, createSpaceLink, loadingLink]
  );

  return { items: dashboardMenuItems, loading };
};
