import { useTranslation } from 'react-i18next';
import { useMyResourcesQuery } from '@/core/apollo/generated/apollo-hooks';
import type { SidebarMenuItemData, SidebarResourceSection } from '@/crd/components/dashboard/DashboardSidebar';
import { usePendingInvitationsCount } from '@/domain/community/pendingMembership/usePendingInvitationsCount';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { buildUserAccountUrl } from '@/main/routing/urlBuilders';
import { useCreateSpaceLink } from '@/main/topLevelPages/myDashboard/useCreateSpaceLink/useCreateSpaceLink';
import { mapResourcesToSidebarItems } from './dashboardDataMappers';

type UseDashboardSidebarOptions = {
  onInvitationsClick: () => void;
  onTipsAndTricksClick: () => void;
  onMyActivityClick?: () => void;
  onMySpaceActivityClick?: () => void;
};

export function useDashboardSidebar({
  onInvitationsClick,
  onTipsAndTricksClick,
  onMyActivityClick,
  onMySpaceActivityClick,
}: UseDashboardSidebarOptions) {
  const { t } = useTranslation('crd-dashboard');
  const { userModel, accountId } = useCurrentUserContext();
  const { count: pendingInvitationsCount } = usePendingInvitationsCount();
  const { link: createSpaceLink } = useCreateSpaceLink();

  const { data: accountData, loading: loadingResources } = useMyResourcesQuery({
    variables: { accountId: accountId ?? '' },
    skip: !accountId,
  });

  const menuItems: SidebarMenuItemData[] = [
    {
      id: 'invitations',
      label: t('sidebar.invitations'),
      iconName: 'Mail',
      onClick: onInvitationsClick,
      badgeCount: pendingInvitationsCount,
    },
    ...(onMyActivityClick
      ? [
          {
            id: 'my-activity',
            label: t('dialogs.myActivity'),
            iconName: 'PenLine',
            onClick: onMyActivityClick,
          },
        ]
      : []),
    ...(onMySpaceActivityClick
      ? [
          {
            id: 'my-space-activity',
            label: t('dialogs.mySpaceActivity'),
            iconName: 'History',
            onClick: onMySpaceActivityClick,
          },
        ]
      : []),
    {
      id: 'tips-and-tricks',
      label: t('sidebar.tipsAndTricks'),
      iconName: 'Lightbulb',
      onClick: onTipsAndTricksClick,
    },
    {
      id: 'my-account',
      label: t('sidebar.myAccount'),
      iconName: 'Tag',
      href: buildUserAccountUrl(userModel?.profile?.url),
    },
    {
      id: 'create-space',
      label: t('sidebar.createSpace'),
      iconName: 'Rocket',
      href: createSpaceLink,
    },
  ];

  const account = accountData?.lookup.account;
  const resources = account
    ? mapResourcesToSidebarItems({
        spaces: account.spaces ?? [],
        virtualContributors: account.virtualContributors ?? [],
        innovationHubs: account.innovationHubs ?? [],
        innovationPacks: account.innovationPacks ?? [],
      })
    : { spaces: [], virtualContributors: [], innovationHubs: [], innovationPacks: [] };

  const resourceSections: SidebarResourceSection[] = [
    { title: t('sidebar.mySpaces'), items: resources.spaces, square: true },
    { title: t('sidebar.virtualContributors'), items: resources.virtualContributors },
    { title: t('sidebar.innovationHubs'), items: resources.innovationHubs },
    { title: t('sidebar.innovationPacks'), items: resources.innovationPacks },
  ].filter(section => section.items.length > 0);

  return {
    menuItems,
    resourceSections,
    loadingResources,
  };
}
