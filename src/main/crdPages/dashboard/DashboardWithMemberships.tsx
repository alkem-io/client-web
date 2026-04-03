import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useHomeSpaceLookupQuery,
  useLatestContributionsQuery,
  useLatestContributionsSpacesFlatQuery,
  useMyMembershipsQuery,
  useRecentSpacesQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { ActivityEventType, LicenseEntitlementType, RoleName } from '@/core/apollo/generated/graphql-schema';
import { ActivityDialog } from '@/crd/components/dashboard/ActivityDialog';
import { ActivityFeed } from '@/crd/components/dashboard/ActivityFeed';
import { CampaignBanner } from '@/crd/components/dashboard/CampaignBanner';
import { DashboardLayout } from '@/crd/components/dashboard/DashboardLayout';
import { DashboardSidebar } from '@/crd/components/dashboard/DashboardSidebar';
import { DashboardSpaces } from '@/crd/components/dashboard/DashboardSpaces';
import { MembershipsTreeDialog } from '@/crd/components/dashboard/MembershipsTreeDialog';
import { RecentSpaces } from '@/crd/components/dashboard/RecentSpaces';
import { ReleaseNotesBanner } from '@/crd/components/dashboard/ReleaseNotesBanner';
import { TipsAndTricksDialog } from '@/crd/components/dashboard/TipsAndTricksDialog';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useHomeSpaceSettings } from '@/domain/community/userCurrent/useHomeSpaceSettings';
import useReleaseNotes from '@/domain/platform/metadata/useReleaseNotes';
import useVirtualContributorWizard from '@/main/topLevelPages/myDashboard/newVirtualContributorWizard/useVirtualContributorWizard';
import {
  mapActivityToFeedItems,
  mapDashboardSpaces,
  mapMembershipsToTree,
  mapRecentSpacesToCompactCards,
} from './dashboardDataMappers';
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
  const { platformRoles, accountEntitlements } = useCurrentUserContext();
  const [activityEnabled, setActivityEnabled] = useState(true);

  // Recent spaces
  const { homeSpaceId, membershipSettingsUrl } = useHomeSpaceSettings();
  const { data: recentSpacesData, loading: recentSpacesLoading } = useRecentSpacesQuery({
    variables: { limit: 5 },
  });
  const { data: homeSpaceData } = useHomeSpaceLookupQuery({
    variables: { spaceId: homeSpaceId! },
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
  });

  // Space memberships for activity feed filters
  const { data: spacesData } = useLatestContributionsSpacesFlatQuery();
  const flatSpaces = spacesData?.me.spaceMembershipsFlat ?? [];

  // Space filter state
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
    { value: 'member', label: 'Member' },
    { value: 'lead', label: 'Lead' },
    { value: 'admin', label: 'Admin' },
  ];

  // Activity feeds data
  const spaceActivitySpaceIds = spaceActivityFilter === 'all' ? flatSpaces.map(m => m.space.id) : [spaceActivityFilter];

  const { data: spaceActivityData, loading: spaceActivityLoading } = useLatestContributionsQuery({
    variables: {
      first: ACTIVITY_LIMIT,
      filter: {
        spaceIds: spaceActivitySpaceIds,
        excludeTypes: EXCLUDED_ACTIVITY_TYPES,
      },
    },
    skip: !activityEnabled || flatSpaces.length === 0,
  });

  const spaceActivityItems = mapActivityToFeedItems(
    (spaceActivityData?.activityFeed?.activityFeed ?? []) as unknown as Parameters<typeof mapActivityToFeedItems>[0]
  );

  // Personal activity — reuse the same query pattern
  const personalSpaceIds = personalSpaceFilter === 'all' ? flatSpaces.map(m => m.space.id) : [personalSpaceFilter];

  const { data: personalActivityData, loading: personalActivityLoading } = useLatestContributionsQuery({
    variables: {
      first: ACTIVITY_LIMIT,
      filter: {
        spaceIds: personalSpaceIds,
        myActivity: true,
        excludeTypes: EXCLUDED_ACTIVITY_TYPES,
      },
    },
    skip: !activityEnabled || flatSpaces.length === 0,
  });

  const personalActivityItems = mapActivityToFeedItems(
    (personalActivityData?.activityFeed?.activityFeed ?? []) as unknown as Parameters<typeof mapActivityToFeedItems>[0]
  );

  // Dashboard spaces (when activity is disabled)
  // useDashboardWithMembershipsLazyQuery is complex - for now use MyMemberships query
  const { data: myMembershipsData, loading: myMembershipsLoading } = useMyMembershipsQuery({
    skip: activityEnabled,
  });

  const dashboardSpaces = mapDashboardSpaces(
    (myMembershipsData?.me?.spaceMembershipsHierarchical ?? []) as Parameters<typeof mapDashboardSpaces>[0],
    homeSpaceId
  );

  // Release notes
  const releaseNotesUrl = tMain('releaseNotes.url');
  const { open: showReleaseNotes, onClose: dismissReleaseNotes } = useReleaseNotes(releaseNotesUrl);

  // Campaign visibility
  const showCampaign =
    platformRoles?.some(role => role === RoleName.PlatformVcCampaign) &&
    accountEntitlements?.some(e => e === LicenseEntitlementType.AccountVirtualContributor);
  const { startWizard, virtualContributorWizard } = useVirtualContributorWizard();

  // Memberships tree for dialog (lazy — only fetched when memberships dialog is open or spaces view is shown)
  const membershipsTreeData = mapMembershipsToTree(
    (myMembershipsData?.me?.spaceMembershipsHierarchical ?? []) as Parameters<typeof mapMembershipsToTree>[0]
  );

  // Tips items — sourced from the existing MUI tips & tricks component's i18n keys
  const tipsKeys = ['explore', 'connect', 'contribute'] as const;
  const tips = tipsKeys.map((key, index) => ({
    id: String(index + 1),
    title: String(tMain(`pages.home.sections.tipsAndTricks.${key}.title` as never)),
    description: String(tMain(`pages.home.sections.tipsAndTricks.${key}.description` as never)),
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
        {activityEnabled && (
          <RecentSpaces
            spaces={recentSpaces}
            loading={recentSpacesLoading}
            hasHomeSpace={!!homeSpaceId}
            homeSpaceSettingsHref={membershipSettingsUrl}
            onExploreAllClick={dialogState.openMemberships}
          />
        )}

        {showReleaseNotes && (
          <ReleaseNotesBanner
            title={tMain('releaseNotes.title')}
            content=""
            href={releaseNotesUrl}
            onDismiss={dismissReleaseNotes}
          />
        )}

        {showCampaign && <CampaignBanner onAction={() => startWizard()} />}

        {activityEnabled ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActivityFeed
              variant="spaces"
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
            />
            <ActivityFeed
              variant="personal"
              title={t('activity.personalTitle')}
              items={personalActivityItems}
              loading={personalActivityLoading}
              spaceFilter={personalSpaceFilter}
              spaceFilterOptions={spaceFilterOptions}
              onSpaceFilterChange={setPersonalSpaceFilter}
              onShowMore={dialogState.openMyActivity}
            />
          </div>
        ) : (
          <DashboardSpaces spaces={dashboardSpaces} loading={myMembershipsLoading} />
        )}
      </DashboardLayout>
      {virtualContributorWizard}

      <TipsAndTricksDialog
        open={dialogState.openDialog === 'tips-and-tricks'}
        onClose={dialogState.closeDialog}
        tips={tips}
        forumHref="/forum"
      />

      <ActivityDialog
        open={dialogState.openDialog === 'my-activity'}
        onClose={dialogState.closeDialog}
        title={t('activity.personalTitle')}
      >
        <ActivityFeed
          variant="personal"
          title=""
          items={personalActivityItems}
          loading={personalActivityLoading}
          spaceFilter={personalSpaceFilter}
          spaceFilterOptions={spaceFilterOptions}
          onSpaceFilterChange={setPersonalSpaceFilter}
        />
      </ActivityDialog>

      <ActivityDialog
        open={dialogState.openDialog === 'my-space-activity'}
        onClose={dialogState.closeDialog}
        title={t('activity.spacesTitle')}
      >
        <ActivityFeed
          variant="spaces"
          title=""
          items={spaceActivityItems}
          loading={spaceActivityLoading}
          spaceFilter={spaceActivityFilter}
          spaceFilterOptions={spaceFilterOptions}
          onSpaceFilterChange={setSpaceActivityFilter}
          roleFilter={roleFilter}
          roleFilterOptions={roleFilterOptions}
          onRoleFilterChange={setRoleFilter}
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
