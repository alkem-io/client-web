import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useHomeSpaceLookupQuery,
  useLatestContributionsQuery,
  useLatestContributionsSpacesFlatQuery,
  useMyMembershipsQuery,
  useRecentSpacesQuery,
} from '@/core/apollo/generated/apollo-hooks';
import {
  ActivityEventType,
  type ActivityFeedRoles,
  LicenseEntitlementType,
  RoleName,
} from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import { ActivityDialog } from '@/crd/components/dashboard/ActivityDialog';
import { ActivityFeed } from '@/crd/components/dashboard/ActivityFeed';
import { CampaignBanner } from '@/crd/components/dashboard/CampaignBanner';
import { DashboardLayout } from '@/crd/components/dashboard/DashboardLayout';
import { DashboardSidebar } from '@/crd/components/dashboard/DashboardSidebar';
import { MembershipsTreeDialog } from '@/crd/components/dashboard/MembershipsTreeDialog';
import { RecentSpaces } from '@/crd/components/dashboard/RecentSpaces';
import { TipsAndTricksDialog } from '@/crd/components/dashboard/TipsAndTricksDialog';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useHomeSpaceSettings } from '@/domain/community/userCurrent/useHomeSpaceSettings';
import useVirtualContributorWizard from '@/main/topLevelPages/myDashboard/newVirtualContributorWizard/useVirtualContributorWizard';
import { mapActivityToFeedItems, mapMembershipsToTree, mapRecentSpacesToCompactCards } from './dashboardDataMappers';
import type { DashboardDialogType } from './useDashboardDialogs';
import { useDashboardSidebar } from './useDashboardSidebar';

type DashboardWithMembershipsProps = {
  dialogState: {
    openDialog: DashboardDialogType | null;
    openTipsAndTricks: () => void;
    openMyActivity: () => void;
    openMySpaceActivity: () => void;
    openMemberships: () => void;
    closeDialog: () => void;
  };
  onPendingMembershipsClick: () => void;
};

const EXCLUDED_ACTIVITY_TYPES = [ActivityEventType.CalloutWhiteboardContentModified];
const ACTIVITY_LIMIT = 10;

export default function DashboardWithMemberships({
  dialogState,
  onPendingMembershipsClick,
}: DashboardWithMembershipsProps) {
  const { t } = useTranslation('crd-dashboard');
  const { t: tMain } = useTranslation();
  const navigate = useNavigate();
  const { platformRoles, accountEntitlements } = useCurrentUserContext();

  // Activity view toggle — persisted in localStorage
  const [activityEnabled, setActivityEnabledState] = useState(() => {
    const cached = localStorage.getItem('dashboardView');
    return cached !== 'SPACES';
  });
  const setActivityEnabled = (enabled: boolean) => {
    localStorage.setItem('dashboardView', enabled ? 'ACTIVITY' : 'SPACES');
    setActivityEnabledState(enabled);
  };

  // Recent spaces
  const { homeSpaceId, membershipSettingsUrl } = useHomeSpaceSettings();
  const { data: recentSpacesData, loading: recentSpacesLoading } = useRecentSpacesQuery({
    variables: { limit: 5 },
  });
  const { data: homeSpaceData } = useHomeSpaceLookupQuery({
    variables: { spaceId: homeSpaceId ?? '' },
    skip: !homeSpaceId,
  });

  const recentSpaces = (() => {
    const spaces = recentSpacesData?.me.mySpaces ?? [];
    const filtered = spaces.filter(s => s.space.id !== homeSpaceId).slice(0, 3);
    const homeSpace = homeSpaceData?.lookup.space;
    const all = homeSpace ? [{ space: homeSpace }, ...filtered] : filtered;
    return mapRecentSpacesToCompactCards(all, homeSpaceId);
  })();

  // Sidebar
  const sidebarData = useDashboardSidebar({
    onInvitationsClick: onPendingMembershipsClick,
    onTipsAndTricksClick: dialogState.openTipsAndTricks,
    onMyActivityClick: activityEnabled ? undefined : dialogState.openMyActivity,
    onMySpaceActivityClick: activityEnabled ? undefined : dialogState.openMySpaceActivity,
  });

  // Activity feed data
  const { data: spacesData } = useLatestContributionsSpacesFlatQuery();
  const flatSpaces = spacesData?.me.spaceMembershipsFlat ?? [];

  const [spaceActivityFilter, setSpaceActivityFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [personalSpaceFilter, setPersonalSpaceFilter] = useState('all');

  const spaceFilterOptions = [
    { value: 'all', label: t('activity.filter.space.all') },
    ...flatSpaces.map(m => ({
      value: m.space.id,
      label: m.space.about.profile.displayName,
    })),
  ];

  const roleFilterOptions = [
    { value: 'all', label: t('activity.filter.role.all') },
    { value: 'member', label: t('activity.filter.role.member') },
    { value: 'lead', label: t('activity.filter.role.lead') },
    { value: 'admin', label: t('activity.filter.role.admin') },
  ];

  const spaceActivitySpaceIds = spaceActivityFilter === 'all' ? flatSpaces.map(m => m.space.id) : [spaceActivityFilter];
  const personalSpaceIds = personalSpaceFilter === 'all' ? flatSpaces.map(m => m.space.id) : [personalSpaceFilter];

  const isActivityDialogOpen =
    dialogState.openDialog === 'my-activity' || dialogState.openDialog === 'my-space-activity';
  const needsActivityData = activityEnabled || isActivityDialogOpen;

  const { data: spaceActivityData, loading: spaceActivityLoading } = useLatestContributionsQuery({
    variables: {
      first: ACTIVITY_LIMIT,
      filter: {
        spaceIds: spaceActivitySpaceIds,
        roles: roleFilter === 'all' ? undefined : [roleFilter as ActivityFeedRoles],
        excludeTypes: EXCLUDED_ACTIVITY_TYPES,
      },
    },
    skip: !needsActivityData || flatSpaces.length === 0,
  });

  const { data: personalActivityData, loading: personalActivityLoading } = useLatestContributionsQuery({
    variables: {
      first: ACTIVITY_LIMIT,
      filter: { spaceIds: personalSpaceIds, myActivity: true, excludeTypes: EXCLUDED_ACTIVITY_TYPES },
    },
    skip: !needsActivityData || flatSpaces.length === 0,
  });

  const spaceActivityItems = mapActivityToFeedItems(spaceActivityData?.activityFeed?.activityFeed ?? [], tMain);
  const personalActivityItems = mapActivityToFeedItems(personalActivityData?.activityFeed?.activityFeed ?? [], tMain);

  // Memberships tree dialog
  const { data: myMembershipsData } = useMyMembershipsQuery({
    skip: dialogState.openDialog !== 'memberships',
  });
  const membershipsTreeData = mapMembershipsToTree(
    (myMembershipsData?.me?.spaceMembershipsHierarchical ?? []) as Parameters<typeof mapMembershipsToTree>[0]
  );

  // Campaign
  const showCampaign =
    platformRoles?.some(role => role === RoleName.PlatformVcCampaign) &&
    accountEntitlements?.some(e => e === LicenseEntitlementType.AccountVirtualContributor);
  const { startWizard, virtualContributorWizard } = useVirtualContributorWizard();

  // Tips — from crd-dashboard namespace
  const tipsRaw = t('tips.items', { returnObjects: true });
  const tipsArray: Array<{ title: string; description: string; imageUrl?: string; url?: string }> = Array.isArray(
    tipsRaw
  )
    ? tipsRaw
    : [];
  const tips = tipsArray.map((item, index) => ({
    id: String(index),
    title: item.title,
    description: item.description,
    imageUrl: item.imageUrl,
    href: item.url,
  }));

  return (
    <>
      <DashboardLayout
        sidebar={
          <DashboardSidebar
            menuItems={sidebarData.menuItems}
            resourceSections={sidebarData.resourceSections}
            activityEnabled={activityEnabled}
            onActivityToggle={setActivityEnabled}
          />
        }
      >
        <RecentSpaces
          spaces={recentSpaces}
          loading={recentSpacesLoading}
          hasHomeSpace={!!homeSpaceId}
          homeSpaceSettingsHref={membershipSettingsUrl}
          onExploreAllClick={dialogState.openMemberships}
          onPinClick={() => membershipSettingsUrl && navigate(membershipSettingsUrl)}
        />

        {showCampaign && <CampaignBanner onAction={() => startWizard()} />}

        {activityEnabled && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActivityFeed
              variant="spaces"
              feedId="inline-spaces"
              title={t('activity.spacesTitle')}
              items={spaceActivityItems}
              loading={spaceActivityLoading}
              spaceFilter={spaceActivityFilter}
              spaceFilterOptions={spaceFilterOptions}
              onSpaceFilterChange={setSpaceActivityFilter}
              roleFilter={roleFilter}
              roleFilterOptions={roleFilterOptions}
              onRoleFilterChange={setRoleFilter}
              onShowMore={dialogState.openMySpaceActivity}
              maxItems={7}
            />
            <ActivityFeed
              variant="personal"
              feedId="inline-personal"
              title={t('activity.personalTitle')}
              items={personalActivityItems}
              loading={personalActivityLoading}
              spaceFilter={personalSpaceFilter}
              spaceFilterOptions={spaceFilterOptions}
              onSpaceFilterChange={setPersonalSpaceFilter}
              onShowMore={dialogState.openMyActivity}
              maxItems={7}
            />
          </div>
        )}
      </DashboardLayout>
      {virtualContributorWizard}

      <TipsAndTricksDialog
        open={dialogState.openDialog === 'tips-and-tricks'}
        onClose={dialogState.closeDialog}
        tips={tips}
        findMoreHref={t('dialogs.findMoreUrl')}
        findMoreLabel={t('dialogs.findMore')}
      />

      <ActivityDialog
        open={dialogState.openDialog === 'my-activity'}
        onClose={dialogState.closeDialog}
        title={t('activity.personalTitle')}
      >
        <ActivityFeed
          variant="personal"
          feedId="dialog-personal"
          title=""
          items={personalActivityItems}
          loading={personalActivityLoading}
          spaceFilter={personalSpaceFilter}
          spaceFilterOptions={spaceFilterOptions}
          onSpaceFilterChange={setPersonalSpaceFilter}
          embedded={true}
        />
      </ActivityDialog>

      <ActivityDialog
        open={dialogState.openDialog === 'my-space-activity'}
        onClose={dialogState.closeDialog}
        title={t('activity.spacesTitle')}
      >
        <ActivityFeed
          variant="spaces"
          feedId="dialog-spaces"
          title=""
          items={spaceActivityItems}
          loading={spaceActivityLoading}
          spaceFilter={spaceActivityFilter}
          spaceFilterOptions={spaceFilterOptions}
          onSpaceFilterChange={setSpaceActivityFilter}
          roleFilter={roleFilter}
          roleFilterOptions={roleFilterOptions}
          onRoleFilterChange={setRoleFilter}
          embedded={true}
        />
      </ActivityDialog>

      <MembershipsTreeDialog
        open={dialogState.openDialog === 'memberships'}
        onClose={dialogState.closeDialog}
        nodes={membershipsTreeData}
        seeMoreHref="/spaces"
      />
    </>
  );
}
